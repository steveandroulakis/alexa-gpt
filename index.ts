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
        const speechText = 'Welcome to the skill, you can say Hello!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// Create a Request Handler for the HelloWorldIntent
const HelloWorldRequestHandler = {
    canHandle(handlerInput: any) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput: any) {
        const speechText = 'Hello, World!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

dotenv.config();

const port = process.env.PORT;

// Add the Request Handler to the Skill Builder
skillBuilder.addRequestHandlers(
    HelloWorldRequestHandler,
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