const { EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");

class ModeratorEmbedsManager {
  constructor(configPath = "./src/moderatorEmbeds.json") {
    this.configPath = configPath;
    this.config = {
      alreadyMemberEmbedId: "",
      alreadyMemberList: [],
      joinRequestEmbedId: "",
      joinRequestList: [],
      moderatorChannelId: "",
    };
  }

  // Load configuration from file
  async loadConfig() {
    try {
      const configExists = await this.fileExists(this.configPath);
      if (configExists) {
        const data = await fs.readFile(this.configPath, "utf8");
        const loadedConfig = JSON.parse(data);

        // Merge with default config to ensure all keys exist
        this.config = { ...this.config, ...loadedConfig };
        console.log("Moderator Embeds data loaded from", this.configPath);
      } else {
        console.log("No Moderator Embeds file found, using defaults");
        await this.saveConfig(); // Create the file with defaults
      }
    } catch (error) {
      console.error("Error loading file:", error);
      console.log("Using defaults");
    }
  }

  // Save configuration to file
  async saveConfig() {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configPath, configData, "utf8");
      //console.log("Moderator Embeds data saved to", this.configPath);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

  // Check if file exists
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getModeratorEmbedsData() {
    return { ...this.config };
  }

  async setModeratorChannelId(value) {
    this.config.moderatorChannelId = value;
    await this.saveConfig();
    return this.config.moderatorChannelId;
  }

  getModeratorChannelId() {
    return this.config.moderatorChannelId;
  }

  async setAlreadyMemberEmbedId(value) {
    this.config.alreadyMemberEmbedId = value;
    await this.saveConfig();
    return this.config.alreadyMemberEmbedId;
  }

  getAlreadyMemberEmbedId() {
    return this.config.alreadyMemberEmbedId;
  }

  getAlreadyMemberList() {
    return this.config.alreadyMemberList;
  }

  async setAlreadyMemberList(value) {
    this.config.alreadyMemberList.push(value);
    await this.saveConfig();
    return this.config.alreadyMemberList;
  }

  async removeAlreadyMemberList(value) {
    value = value - 1;
    if (value > -1) {
      this.config.alreadyMemberList.splice(value, 1);
    }
    await this.saveConfig();
    return this.config.alreadyMemberList;
  }

  async cleanAlreadyMemberList(value) {
    const remove = this.config.alreadyMemberList.indexOf(value);
    if (remove > -1) {
      this.config.alreadyMemberList.splice(remove, 1);
    }
    await this.saveConfig();
    return this.config.alreadyMemberList;
  }

  async setJoinRequestEmbedId(value) {
    this.config.joinRequestEmbedId = value;
    await this.saveConfig();
    return this.config.joinRequestEmbedId;
  }

  getJoinRequestEmbedId() {
    return this.config.joinRequestEmbedId;
  }

  getJoinRequestList() {
    return this.config.joinRequestList;
  }

  async setJoinRequestList(value) {
    this.config.joinRequestList.push(value);
    await this.saveConfig();
    return this.config.joinRequestList;
  }

  async removeJoinRequestList(value) {
    value = value - 1;
    if (value > -1) {
      this.config.joinRequestList.splice(value, 1);
    }
    await this.saveConfig();
    return this.config.joinRequestList;
  }

  async cleanJoinRequestList(value) {
    const remove = this.config.joinRequestList.indexOf(value);
    if (remove > -1) {
      this.config.joinRequestList.splice(remove, 1);
    }
    await this.saveConfig();
    return this.config.joinRequestList;
  }

  refreshMembersEmbed() {
    let alreadyMembersList = this.getAlreadyMemberList();
    let listString = "";
    if (alreadyMembersList.length == 0) {
      listString = "No users in the list.";
    } else {
      for (let i = 0; i < alreadyMembersList.length; i++) {
        listString = `${listString} ${i + 1}. ${alreadyMembersList[i]}\n`;
      }
    }
    const memberEmbed = new EmbedBuilder().setColor("#4287f5").setTitle("Already members list").setDescription(listString);
    return memberEmbed;
  }

  async editMembersEmbed(interaction) {
    try {
      const embed = this.refreshMembersEmbed();
      const moderatorChannelId = this.getModeratorChannelId();
      const memberEmbedId = this.getAlreadyMemberEmbedId();
      const existingEmbed = await interaction.guild.channels.cache.get(moderatorChannelId).messages.fetch(memberEmbedId);

      await existingEmbed.edit({ embeds: [embed] });
    } catch (error) {
      console.log("error editing Already Member embed: ", error);
    }
  }

  refreshJoinEmbed() {
    let joinRequestList = this.getJoinRequestList();
    let listString = "";
    if (joinRequestList.length == 0) {
      listString = "No users in the list.";
    } else {
      for (let i = 0; i < joinRequestList.length; i++) {
        listString = `${listString} ${i + 1}. ${joinRequestList[i]}\n`;
      }
    }
    const joinEmbed = new EmbedBuilder().setColor("#4287f5").setTitle("Looking to join list").setDescription(listString);

    return joinEmbed;
  }

  async editJoinEmbed(interaction) {
    try {
      const embed = this.refreshJoinEmbed();
      const moderatorChannelId = this.getModeratorChannelId();
      const joinEmbedId = this.getJoinRequestEmbedId();
      const existingEmbed = await interaction.guild.channels.cache.get(moderatorChannelId).messages.fetch(joinEmbedId);

      await existingEmbed.edit({ embeds: [embed] });
    } catch (error) {
      console.log("error editing Looking to Join embed: ", error);
    }
  }
}

module.exports = ModeratorEmbedsManager;
