// utils/configManager.js - Configuration manager with file persistence
const fs = require("fs").promises;
const path = require("path");

class ConfigManager {
  constructor(configPath = "config.json") {
    this.configPath = configPath;
    this.config = {
      booleanValue: false,
      numberValue: 0,
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
        console.log("Configuration loaded from", this.configPath);
      } else {
        console.log("No config file found, using defaults");
        await this.saveConfig(); // Create the file with defaults
      }
    } catch (error) {
      console.error("Error loading config:", error);
      console.log("Using default configuration");
    }
  }

  // Save configuration to file
  async saveConfig() {
    try {
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configPath, configData, "utf8");
      console.log("Configuration saved to", this.configPath);
    } catch (error) {
      console.error("Error saving config:", error);
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

  // Get boolean value
  getBooleanValue() {
    return this.config.booleanValue;
  }

  // Set boolean value
  async setBooleanValue(value) {
    this.config.booleanValue = Boolean(value);
    await this.saveConfig();
    return this.config.booleanValue;
  }

  // Toggle boolean value
  async toggleBooleanValue() {
    this.config.booleanValue = !this.config.booleanValue;
    await this.saveConfig();
    return this.config.booleanValue;
  }

  // Get number value
  getNumberValue() {
    return this.config.numberValue;
  }

  // Set number value
  async setNumberValue(value) {
    if (typeof value === "number" && !isNaN(value)) {
      this.config.numberValue = value;
      await this.saveConfig();
      return this.config.numberValue;
    } else {
      throw new Error("Invalid number value");
    }
  }

  // Get all config values
  getAllConfig() {
    return { ...this.config };
  }

  // Set multiple values at once
  async setMultipleValues(updates) {
    let changed = false;

    if (updates.hasOwnProperty("booleanValue")) {
      this.config.booleanValue = Boolean(updates.booleanValue);
      changed = true;
    }

    if (updates.hasOwnProperty("numberValue")) {
      if (typeof updates.numberValue === "number" && !isNaN(updates.numberValue)) {
        this.config.numberValue = updates.numberValue;
        changed = true;
      }
    }

    if (changed) {
      await this.saveConfig();
    }

    return this.config;
  }
}

module.exports = ConfigManager;
