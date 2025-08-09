// commands/config.js - Configuration management command
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Manage bot configuration")
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View current configuration"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-boolean")
        .setDescription("Set the boolean value")
        .addBooleanOption((option) => option.setName("value").setDescription("Boolean value to set (true/false)").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("toggle-boolean").setDescription("Toggle the boolean value"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-number")
        .setDescription("Set the number value")
        .addNumberOption((option) => option.setName("value").setDescription("Number value to set").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set-both")
        .setDescription("Set both values at once")
        .addBooleanOption((option) => option.setName("boolean").setDescription("Boolean value to set").setRequired(true))
        .addNumberOption((option) => option.setName("number").setDescription("Number value to set").setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    // Get the config manager from the client
    const configManager = interaction.client.configManager;

    if (!configManager) {
      return await interaction.reply({
        content: "Configuration manager not initialized!",
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case "view": {
          const config = configManager.getAllConfig();
          const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Bot Configuration")
            .addFields(
              {
                name: "Boolean Value",
                value: config.booleanValue ? "True" : "False",
                inline: true,
              },
              {
                name: "Number Value",
                value: config.numberValue.toString(),
                inline: true,
              }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case "set-boolean": {
          const value = interaction.options.getBoolean("value");
          const newValue = await configManager.setBooleanValue(value);

          await interaction.reply({
            content: `Boolean value set to: **${newValue ? "True" : "False"}**`,
            ephemeral: true,
          });
          break;
        }

        case "toggle-boolean": {
          const newValue = await configManager.toggleBooleanValue();

          await interaction.reply({
            content: `Boolean value toggled to: **${newValue ? "True" : "False"}**`,
            ephemeral: true,
          });
          break;
        }

        case "set-number": {
          const value = interaction.options.getNumber("value");
          const newValue = await configManager.setNumberValue(value);

          await interaction.reply({
            content: `Number value set to: **${newValue}**`,
            ephemeral: true,
          });
          break;
        }

        case "set-both": {
          const booleanValue = interaction.options.getBoolean("boolean");
          const numberValue = interaction.options.getNumber("number");

          const newConfig = await configManager.setMultipleValues({
            booleanValue: booleanValue,
            numberValue: numberValue,
          });

          const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("Configuration Updated")
            .addFields(
              {
                name: "Boolean Value",
                value: newConfig.booleanValue ? "True" : "False",
                inline: true,
              },
              {
                name: "Number Value",
                value: newConfig.numberValue.toString(),
                inline: true,
              }
            )
            .setTimestamp();

          await interaction.reply({
            embeds: [embed],
            ephemeral: true,
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error in config command:", error);
      await interaction.reply({
        content: "An error occurred while updating the configuration!",
        ephemeral: true,
      });
    }
  },
};
