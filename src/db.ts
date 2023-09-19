import sqlite from 'bun:sqlite';

export const db = sqlite.open('./db.sqlite');

const settingsDefaultValues = {
  quoiAnswerPercentage: 100,
  quoicoubehAnswerPercentage: 100,
  feurAnswerPercentage: 100,
  mentionAnswerPercentage: 100,
};

/**
 * Create a database with a single 
 */
async function initDb() {
  /**
   * Create table 'IgnoredChannels' with the columns:
   * - channelId: VARCHAR PRIMARY KEY
   * - guildId: VARCHAR
   */
  db.run(`
    CREATE TABLE IF NOT EXISTS IgnoredChannels (
      channelId VARCHAR PRIMARY KEY,
      guildId VARCHAR
    );
  `);

  /**
   * Create table 'Config'
   */
  db.run(`
    CREATE TABLE IF NOT EXISTS Config (
      guildId VARCHAR PRIMARY KEY,
      quoiAnswerPercentage INTEGER NOT NULL DEFAULT ${settingsDefaultValues.quoiAnswerPercentage},
      quoicoubehAnswerPercentage INTEGER NOT NULL DEFAULT ${settingsDefaultValues.quoicoubehAnswerPercentage},
      feurAnswerPercentage INTEGER NOT NULL DEFAULT ${settingsDefaultValues.feurAnswerPercentage},
      mentionAnswerPercentage INTEGER NOT NULL DEFAULT ${settingsDefaultValues.mentionAnswerPercentage}
    );
  `);
}

export async function addChannelToIgnoreList(channelId: string, guildId: string) {
  return db.run(`
    INSERT INTO IgnoredChannels (channelId, guildId)
    VALUES (?, ?)
    ON CONFLICT(channelId) DO NOTHING
  `, [channelId, guildId]);
}

export function getIgnoredChannels(guildId: string): { channelId: string }[] {
  return db.prepare(`
    SELECT channelId
    FROM IgnoredChannels
    WHERE guildId = ?
  `, [guildId]).all() as Array<{ channelId: string }>;
}

export async function removeChannelFromIgnoreList(channelId: string) {
  return db.run(`
    DELETE FROM IgnoredChannels
    WHERE channelId = ?
  `, [channelId]);
}

export function setSetting(guildId: string, setting: keyof typeof settingsDefaultValues, value: string | number) {
  return db.run(`
    INSERT INTO Config (guildId, ${setting})
    VALUES (?, ?)
    ON CONFLICT(guildId) DO UPDATE SET ${setting} = ?
  `, [guildId, value, value]);
}

export function getSetting(guildId: string, setting: 'quoiAnswerPercentage'): number;
export function getSetting(guildId: string, setting: 'quoicoubehAnswerPercentage'): number;
export function getSetting(guildId: string, setting: 'feurAnswerPercentage'): number;
export function getSetting(guildId: string, setting: 'mentionAnswerPercentage'): number;
export function getSetting(guildId: string, setting: keyof typeof settingsDefaultValues) {
  const values = db.prepare(`
    SELECT ${setting}
    FROM Config
    WHERE guildId = ?
  `, [guildId]).values();

  if (values.length === 0) {
    return settingsDefaultValues[setting];
  }

  return values[0][0];
}

initDb();
