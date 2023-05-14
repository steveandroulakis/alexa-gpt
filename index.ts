import * as dotenv from "dotenv";
const express = require('express');
import { SkillBuilders } from 'ask-sdk-core';
import { RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';
import { ExpressAdapter } from 'ask-sdk-express-adapter';

// Create a Skill Builder
const skillBuilder = SkillBuilders.custom();

const LaunchRequestHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput: any) {
        const speechText = 'Talk to me';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// Create a Request Handler for ChatGPTIntent
const ChatGPTIntent = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ChatGPTIntent';
    },
    handle(handlerInput: any) {
        
        // get 'count' session attribute or set it to 0
        let count = handlerInput.attributesManager.getSessionAttributes().count || 0;
        count += 1;
        handlerInput.attributesManager.setSessionAttributes({ count });

        const speechText = `Hello, World ${count}!`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

dotenv.config();

const port = process.env.PORT;

// Add the Request Handler to the Skill Builder
skillBuilder.addRequestHandlers(
    ChatGPTIntent,
    LaunchRequestHandler
);

// Create an Express Adapter
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, true, true);

// Create an Express server and route incoming requests to the adapter
const server = express();
server.post('/', adapter.getRequestHandlers());

// Start the server
server.listen(port, () => console.log(`Alexa skill server started on port ${port}.`));