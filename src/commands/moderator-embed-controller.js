const { subscribe } = require("diagnostics_channel");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ActionRow,
  messageLink,
} = require("discord.js");
const fs = require("fs");
const path = "./src/embedData.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moderator-embed")
    .setDescription("Manage moderator embeds")
    .addSubcommand((subcommand) => subcommand.setName("create-moderator-embed").setDescription("Create moderator embed with queues"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-already-member")
        .setDescription('Remove user from "Already Member" list')
        .addIntegerOption((option) => option.setName("list-number").setDescription("Choose the user number to remove").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-looking-to-join")
        .setDescription('Remove user from "Looking to Join" list')
        .addIntegerOption((option) => option.setName("list-number").setDescription("Choose the user number to remove").setRequired(true)),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const moderatorEmbedData = await interaction.client.moderatorEmbedManager.getModeratorEmbedsData();

    try {
      switch (subcommand) {
        case "create-moderator-embed": {
          try {
            const memberEmbed = interaction.client.moderatorEmbedManager.refreshModeratorEmbed();
            if (moderatorEmbedData.moderatorEmbedId !== "") {
              try {
                const getMessageStatus = await interaction.channel.messages.fetch(moderatorEmbedData.moderatorEmbedId);
                await interaction.reply({
                  content: `Embed already exists`,
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Moderator Embed already exists.");
              } catch (error) {
                const sentEmbed = await interaction.channel.send({ embeds: [memberEmbed] });
                moderatorEmbedData.moderatorEmbedId = sentEmbed.id;
                await interaction.client.moderatorEmbedManager.setModeratorChannelId(interaction.channel.id);
                await interaction.client.moderatorEmbedManager.setModeratorEmbedId(moderatorEmbedData.moderatorEmbedId);
                await interaction.reply({
                  content: "Id was found in database but embed was not found from channel. Sent new embed.",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Moderator Embed's id was found in database but message wasn't found in channel. Sent new Embed");
              }
            } else {
              try {
                const sentEmbed = await interaction.channel.send({ embeds: [memberEmbed] });
                moderatorEmbedData.moderatorEmbedId = sentEmbed.id;
                await interaction.client.moderatorEmbedManager.setModeratorChannelId(interaction.channel.id);
                await interaction.client.moderatorEmbedManager.setModeratorEmbedId(moderatorEmbedData.moderatorEmbedId);
                await interaction.reply({
                  content: "Moderator Embed created",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Moderator Embed created");
              } catch (error) {
                await interaction.reply({
                  content: "Failed to create moderator member embed",
                  flags: MessageFlags.Ephemeral,
                });
                console.log("Failed to create moderator member embed: ", error);
              }
            }
          } catch (error) {
            console.log("Failed to load moderator embed data: ", error);
          }
          break;
        }
        case "remove-already-member": {
          const num = interaction.options.getInteger("list-number");
          const listLength = interaction.client.moderatorEmbedManager.getAlreadyMemberList();

          if (listLength.length > 0) {
            if (num <= listLength.length + 1 && num > 0) {
              await interaction.client.moderatorEmbedManager.removeAlreadyMemberList(num);
              await interaction.client.moderatorEmbedManager.editModeratorEmbed(interaction);
              await interaction.reply({
                content: 'Removed user from "Already Member" list',
                flags: MessageFlags.Ephemeral,
              });
              break;
            } else {
              await interaction.reply({
                content: "No user found in the selected spot",
                flags: MessageFlags.Ephemeral,
              });
              break;
            }
          } else {
            await interaction.reply({
              content: "No users in the list",
              flags: MessageFlags.Ephemeral,
            });
            break;
          }
        }
        case "remove-looking-to-join": {
          const num = interaction.options.getInteger("list-number");
          const listLength = interaction.client.moderatorEmbedManager.getLookingToJoinList();

          if (listLength.length > 0) {
            if (num <= listLength.length + 1 && num > 0) {
              await interaction.client.moderatorEmbedManager.removeLookingToJoinList(num);
              await interaction.client.moderatorEmbedManager.editModeratorEmbed(interaction);
              await interaction.reply({
                content: 'Removed user from "Looking to Join" list',
                flags: MessageFlags.Ephemeral,
              });
              break;
            } else {
              await interaction.reply({
                content: "No user found in the selected spot",
                flags: MessageFlags.Ephemeral,
              });
              break;
            }
          } else {
            await interaction.reply({
              content: "No users in the list",
              flags: MessageFlags.Ephemeral,
            });
            break;
          }
        }
      }
    } catch (error) {
      await interaction.reply({ content: "Error processing moderator embed command", flags: MessageFlags.Ephemeral });
      console.log("Error processing moderator embed command: ", error);
    }
  },
};
