import * as dotenv from "dotenv";
const express = require('express');
import { HandlerInput, SkillBuilders } from 'ask-sdk-core';
import { Response } from 'ask-sdk-model';
import { ExpressAdapter } from 'ask-sdk-express-adapter';

const { Configuration, OpenAIApi } = require('openai');

dotenv.config();

const port = process.env.PORT;
const openaiKey = process.env.OPEN_AI_KEY;

const configuration = new Configuration({
    apiKey: openaiKey,
});

const openai = new OpenAIApi(configuration);

// Create a Skill Builder
const skillBuilder = SkillBuilders.custom();

const LaunchRequestHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput: any) {
        const speechText = 'How can GPT help? Begin your question with tell me';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const RequestInterceptor = {
    process(handlerInput: any) {
        console.log(`Request received: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};


// Create a Request Handler for ChatGPTIntent
const ChatGPTIntent = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ChatGPTIntent';
    },
    async handle(handlerInput: any) {

        let speakOutput = 'I can\'t help you with that.';

        // get 'question' slot value
        const question = handlerInput.requestEnvelope.request.intent.slots.question.value;

        console.log(`QUESTION: ${question}`);

        // get messages from session attributes or set it to empty array
        let messages = handlerInput.attributesManager.getSessionAttributes().messages || [{ role: 'system', content: `You are a voice assistant and will give answers suitable for text to speech. Your answers should be no more than 3 sentences. Try to guess what the question might be about given the context and possible voice to text transcription mistakes. Only answer what is asked. Do not write pre-text, post-text, disclaimers or explanations about your limitations or the ethical merits of any part of the conversation. Do not talk about yourself. Don't introduce unnecessary fluff into answers. Always answer what is asked. Always follow these guidelines.` }];

        const questionMessage = { role: 'user', content: `tell me ${question}` }

        let answerMessage = { role: 'assistant', content: 'I don\'t know. Ask again?' };

        const doIt = async () => {
            try {
                messages.push(questionMessage);

                const completion = await openai.createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages
                });
                console.log(completion.data);
                answerMessage = completion.data.choices[0].message;
                messages.push(answerMessage);
                
                console.log(answerMessage);
                console.log(answerMessage.content);
                speakOutput = answerMessage.content;
                speakOutput = `${speakOutput}. Anything else?`

            } catch (error) {
                if (error.response) {
                    console.error(error.response.status, error.response.data);
                } else {
                    console.error(`Error with OpenAI API request: ${error.message}`);
                }
                
            }
        }

        await doIt();

        // set session attribute messages to messages
        handlerInput.attributesManager.setSessionAttributes({ messages });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const StopIntentHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput: any) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

const anythingHandler = {
    canHandle(handlerInput: any) {
        return true;
    },
    async handle(handlerInput: any) {
        const speechText = 'Try again. Begin your question with the words, tell me';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput: HandlerInput, error: Error): boolean {
        return error.name.startsWith('AskSdk');
    },
    handle(handlerInput: HandlerInput, error: Error): Response {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('An error was encountered while handling your request. Try again later')
            .getResponse();
    },
};


// Add the Request Handler to the Skill Builder
skillBuilder.addRequestHandlers(
    ChatGPTIntent,
    StopIntentHandler,
    LaunchRequestHandler,
    anythingHandler
);

skillBuilder.addErrorHandlers(ErrorHandler);

skillBuilder.addRequestInterceptors(
    RequestInterceptor
);

// Create an Express Adapter
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, true, true);

// Create an Express server and route incoming requests to the adapter
const server = express();
server.post('/', adapter.getRequestHandlers());

// GET request handler for '/'
server.get('/', (req: any, res: any) => {
    res.send('Hello World!');
});

// Start the server
server.listen(port, () => console.log(`Alexa skill server started on port ${port}.`));