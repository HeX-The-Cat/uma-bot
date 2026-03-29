const { EmbedBuilder } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");

class ModeratorEmbedManager {
  constructor(configPath = "./src/moderatorEmbed.json") {
    this.configPath = configPath;
    this.config = {
      alreadyMemberList: [],
      joinRequestList: [],
      moderatorChannelId: "",
      moderatorChannelId: "",
    };
  }

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

  async saveConfig() {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configPath, configData, "utf8");
      //console.log("Moderator Embeds data saved to", this.configPath);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }

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

  // channel and message data stuff
  async setModeratorChannelId(value) {
    this.config.moderatorChannelId = value;
    await this.saveConfig();
    return this.config.moderatorChannelId;
  }
  getModeratorChannelId() {
    return this.config.moderatorChannelId;
  }
  async setModeratorEmbedId(value) {
    this.config.moderatorEmbedId = value;
    await this.saveConfig();
    return this.config.moderatorEmbedId;
  }
  getModeratorEmbedId() {
    return this.config.moderatorEmbedId;
  }

  // manipulate already members list
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

  // manipulate join request list
  getLookingToJoinList() {
    return this.config.joinRequestList;
  }
  async setLookingToJoinList(value) {
    this.config.joinRequestList.push(value);
    await this.saveConfig();
    return this.config.joinRequestList;
  }
  async removeLookingToJoinList(value) {
    value = value - 1;
    if (value > -1) {
      this.config.joinRequestList.splice(value, 1);
    }
    await this.saveConfig();
    return this.config.joinRequestList;
  }

  // used by the welcome embed to add/remove the interacting user to and from list
  async cleanAlreadyMemberList(value) {
    const remove = this.config.alreadyMemberList.indexOf(value);
    if (remove > -1) {
      this.config.alreadyMemberList.splice(remove, 1);
    }
    await this.saveConfig();
    return this.config.alreadyMemberList;
  }
  async cleanLookingToJoinList(value) {
    const remove = this.config.joinRequestList.indexOf(value);
    if (remove > -1) {
      this.config.joinRequestList.splice(remove, 1);
    }
    await this.saveConfig();
    return this.config.joinRequestList;
  }

  // moderator embed manipulation
  async editModeratorEmbed(interaction) {
    try {
      const embed = this.refreshModeratorEmbed();
      const moderatorChannelId = this.getModeratorChannelId();
      const moderatorEmbedId = this.getModeratorEmbedId();
      const existingEmbed = await interaction.guild.channels.cache.get(moderatorChannelId).messages.fetch(moderatorEmbedId);

      await existingEmbed.edit({ embeds: [embed] });
    } catch (error) {
      console.log("error editing Moderator Embed: ", error);
    }
  }
  refreshModeratorEmbed() {
    let joinRequestList = this.getLookingToJoinList();
    let joinRequestString = "";
    let alreadyMemberList = this.getAlreadyMemberList();
    let alreadyMemberString = "";

    if (joinRequestList.length == 0) {
      joinRequestString = "No users in the list.";
    } else {
      for (let i = 0; i < joinRequestList.length; i++) {
        joinRequestString = `${joinRequestString} ${i + 1}. ${joinRequestList[i]}\n`;
      }
    }

    if (alreadyMemberList.length == 0) {
      alreadyMemberString = "No users in the list.";
    } else {
      for (let i = 0; i < alreadyMemberList.length; i++) {
        alreadyMemberString = `${alreadyMemberString} ${i + 1}. ${alreadyMemberList[i]}\n`;
      }
    }

    const moderatorEmbed = new EmbedBuilder()
      .setColor("#4287f5")
      .addFields({ name: "Already member:", value: alreadyMemberString }, { name: "Looking to join:", value: joinRequestString });

    return moderatorEmbed;
  }
}

module.exports = ModeratorEmbedManager;
