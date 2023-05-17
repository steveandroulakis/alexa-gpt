The plan is to orchestrate API interactions reliably using Temporal.io
### Deploy the endpoint
- Figure out your Open AI key (for GPT access)
- `npm install`
- `docker build -t alexa-gpt .`
- `docker run -p 3000:3000 -d -e PORT=3000 -e OPEN_AI_KEY=YOUR_OPEN_AI_KEY alexa-gpt`
- OR run the docker container in AWS Lightsail or ECS or similar

### Deploy the skill
- Insert the skill endpoint URL in `skill.json`
- Change the invocation name in `en-US.json`
- `cd TemporalGPTSkill && ask deploy && cd ..`

### Test the skill
- Once deployed, you can use `ask dialog` to interact with it (or speak to your device)

### Run guide
- Say `tell me` at the beginning of each question