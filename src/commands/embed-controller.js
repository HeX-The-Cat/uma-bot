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
    .setName("welcome-embed")
    .setDescription("Manage welcome embed")
    .addSubcommand((subcommand) => subcommand.setName("create-embed").setDescription("Create Embed"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update-description")
        .setDescription("Update welcome embed description")
        .addStringOption((option) => option.setName("embed-description").setDescription("Adjust embed message").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update-color")
        .setDescription("Update welcome embed side color")
        .addStringOption((option) => option.setName("embed-color").setDescription("Change embed color").setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const readData = async () => {
      try {
        const data = await fs.promises.readFile(path, "utf8");
        return JSON.parse(data); // Parse the JSON string and return it
      } catch (err) {
        console.error("Error reading file:", err);
        return null;
      }
    };

    const writeData = async (data) => {
      try {
        await fs.promises.writeFile(path, JSON.stringify(data, null, 2), "utf8");
        console.log("Embed data updated successfully.");
      } catch (err) {
        console.error("Error writing to file:", err);
      }
    };

    const refreshEmbed = async (embedData) => {
      const embed = new EmbedBuilder()
        .setColor(`${embedData.embedColor}`)
        .setTitle("Welcome to Thrumbos!")
        .setDescription(embedData.embedDescription)
        .addFields(
          { name: "Already member", value: 'If you\'re already member of the club, please click "Already member" below' },
          { name: "Looking to join", value: 'If you\'re looking to join the club, click "Looking to join" below' }
        );
      return embed;
    };

    const subcommand = interaction.options.getSubcommand();

    try {
      const embedData = await readData();

      let embed = await refreshEmbed(embedData);

      const memberRoleRequest = new ButtonBuilder().setCustomId("memberRoleRequest").setLabel("Already member").setStyle(ButtonStyle.Secondary);
      const lookingToJoinRequest = new ButtonBuilder().setCustomId("lookingtoJoinRequest").setLabel("Looking to join").setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(memberRoleRequest, lookingToJoinRequest);

      switch (subcommand) {
        case "create-embed": {
          if (embedData.embedId !== "") {
            try {
              const getMessageStatus = await interaction.channel.messages.fetch(embedData.embedId);
              await interaction.reply({
                content: `Embed already exists`,
                flags: MessageFlags.Ephemeral,
              });
            } catch (error) {
              const sentEmbed = await interaction.channel.send({ embeds: [embed], components: [row] });
              embedData.embedId = sentEmbed.id;
              await writeData(embedData);
              await interaction.reply({
                content: "Id was found in database but embed was not found from channel. Sent new embed.",
                flags: MessageFlags.Ephemeral,
              });
              console.log("embed doesn't exist");
            }
          } else {
            try {
              const sentEmbed = await interaction.channel.send({ embeds: [embed], components: [row] });
              embedData.embedId = sentEmbed.id;
              await writeData(embedData);
              await interaction.reply({
                content: "Embed created",
                flags: MessageFlags.Ephemeral,
              });
            } catch (err) {
              await interaction.reply({
                content: "Failed to create embed",
                flags: MessageFlags.Ephemeral,
              });
              console.log("Failed to create embed: ", err);
            }
          }
          break;
        }

        case "update-description": {
          try {
            const existingEmbed = await interaction.channel.messages.fetch(embedData.embedId);
            embedData.embedDescription = interaction.options.getString("embed-description");

            embed = await refreshEmbed(embedData);

            await existingEmbed.edit({ embeds: [embed] });

            writeData(embedData);

            interaction.reply({
              content: "Updated embed description",
              flags: MessageFlags.Ephemeral,
            });
          } catch (error) {
            interaction.reply({
              content: "Failed to update embed description",
              flags: MessageFlags.Ephemeral,
            });
            console.log("failed to update embed: ", error);
          }
          break;
        }

        case "update-color":
          {
            try {
              const existingEmbed = await interaction.channel.messages.fetch(embedData.embedId);
              const newColor = interaction.options.getString("embed-color");
              const tester = /^#[0-9a-f]{6}$/i;

              if (tester.test(newColor)) {
                embedData.embedColor = newColor;

                embed = await refreshEmbed(embedData);

                await existingEmbed.edit({ embeds: [embed] });

                writeData(embedData);

                interaction.reply({
                  content: "Updated embed color",
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                interaction.reply({
                  content: 'Invalid hex color value. Check that the value starts with "#" and has 6 digits/letters',
                  flags: MessageFlags.Ephemeral,
                });
              }
            } catch (error) {
              interaction.reply({
                content: "Failed to update embed color",
                flags: MessageFlags.Ephemeral,
              });
              console.log("failed to update embed: ", error);
            }
          }
          break;
      }
    } catch (error) {
      console.log(error);
    }
  },

  async handleButtonClick(interaction) {
    const moderatorEmbedsManager = interaction.client.moderatorEmbedsManager;

    const giveRoleIdMap = {
      memberRoleRequest: "1406795110301044886",
      lookingtoJoinRequest: "1405010208538886174",
    };

    const alreadyCordMemberMap = {
      roleMember: "856710964928839703",
      roleOfficer: "1400934230136983603",
      roleOwner: "856710342881443871",
    };

    try {
      const roleId = giveRoleIdMap[interaction.customId];
      const member = interaction.guild.members.cache.get(interaction.user.id);

      const hasExistingMemberRole = Object.values(alreadyCordMemberMap).some((roleId) => member.roles.cache.has(roleId));

      if (hasExistingMemberRole) {
        await interaction.reply({ content: "You're already confirmed member of the club", flags: MessageFlags.Ephemeral });
      } else {
        if (member.roles.cache.has(roleId)) {
          switch (roleId) {
            case giveRoleIdMap.memberRoleRequest:
              await moderatorEmbedsManager.cleanAlreadyMemberList(interaction.user.username);
              await moderatorEmbedsManager.editMembersEmbed(interaction);
              break;

            case giveRoleIdMap.lookingtoJoinRequest:
              moderatorEmbedsManager.cleanJoinRequestList(interaction.user.username);
              await moderatorEmbedsManager.editJoinEmbed(interaction);
              break;
          }
          await member.roles.remove(roleId);
          await interaction.reply({ content: "Removed the role from you", flags: MessageFlags.Ephemeral });
        } else {
          switch (roleId) {
            case giveRoleIdMap.memberRoleRequest:
              await moderatorEmbedsManager.setAlreadyMemberList(interaction.user.username);
              await moderatorEmbedsManager.editMembersEmbed(interaction);
              await interaction.reply({
                content:
                  "Welcome to Thrumbos server!\n\nWe'll get in touch as soon as we can.\n\nPlease change your server nickname to match your in game name to better identify you and come say hi in the debut channel.",
                flags: MessageFlags.Ephemeral,
              });
              break;

            case giveRoleIdMap.lookingtoJoinRequest:
              moderatorEmbedsManager.setJoinRequestList(interaction.user.username);
              await moderatorEmbedsManager.editJoinEmbed(interaction);
              await interaction.reply({
                content:
                  "Welcome to Thrumbos server!\n\nWe'll get in touch as soon as we can.\n\nCome say hi in the debut channel and tell us how to find you in game.",
                flags: MessageFlags.Ephemeral,
              });
              break;
          }
          await member.roles.add(roleId);
        }
      }
    } catch (error) {
      console.log("Button interaction error: ", error);
      await interaction.reply({
        content: "Role manager failed",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
