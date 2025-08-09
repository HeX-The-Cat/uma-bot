// deploy-commands.js - Script to register slash commands with Discord
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const commands = [];
const commandsPath = path.join(__dirname, "commands");

// Check if commands directory exists
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
      console.log(`Prepared command: ${command.data.name}`);
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.BOT_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Choose deployment method:
    // For guild-specific commands:
    const data = await rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.SERVER_ID), { body: commands });

    // For global commands (takes up to 1 hour to propagate):
    //const data = await rest.put(Routes.applicationCommands(process.env.BOT_ID), { body: commands });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error("Error deploying commands:", error);
  }
})();
