import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { addChannelToIgnoreList, getIgnoredChannels, getSetting, removeChannelFromIgnoreList, setSetting } from "./db";

const commands = {
  'channel-ignore': {
    command: new SlashCommandBuilder()
      .setName('channel-ignore')
      .setDescription('Ajoute ou retire un salon de la liste des salons ignorés')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addSubcommand(subcommand => subcommand
        .setName('ajouter')
        .setDescription('Ajoute un salon à la liste des salons ignorés')
        .addChannelOption(option => option
          .setName('salon')
          .setDescription('Le salon à ajouter à la liste des salons ignorés')
          .setRequired(true)
        )
      )
      .addSubcommand(subcommand => subcommand
        .setName('retirer')
        .setDescription('Retire un salon de la liste des salons ignorés')
        .addChannelOption(option => option
          .setName('salon')
          .setDescription('Le salon à retirer de la liste des salons ignorés')
          .setRequired(true)
        )
      ),
    run: async (inter: ChatInputCommandInteraction) => {
      const subcommand = inter.options.getSubcommand()
      const channel = inter.options.getChannel('salon', true)

      switch (subcommand) {
        case 'add':
          await addChannelToIgnoreList(channel.id, inter.guildId ?? '')
          void inter.reply({
            content: `Le salon ${channel.name} (${channel.id}) a été ajouté à la liste des salons ignorés`,
            ephemeral: true
          })
          break
        case 'remove':
          await removeChannelFromIgnoreList(channel.id)
          void inter.reply({
            content: `Le salon ${channel.name} (${channel.id}) a été retiré de la liste des salons ignorés`,
            ephemeral: true
          })
          break
      }
    }
  },
  'set-config': {
    command: new SlashCommandBuilder()
      .setName('set-config')
      .setDescription('Change la configuration du bot')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .addNumberOption(option => option
        .setName('chance_de_reponse_quoi')
        .setDescription('Le pourcentage de chance de réponse à un "quoi"')
        .setRequired(false)
      )
      .addNumberOption(option => option
        .setName('chance_de_reponse_quoicoubeh')
        .setDescription('Le pourcentage de chance de réponse à un "quoicoubeh"')
        .setRequired(false)
      )
      .addNumberOption(option => option
        .setName('chance_de_reponse_feur')
        .setDescription('Le pourcentage de chance de réponse à un "feur"')
        .setRequired(false)
      )
      .addNumberOption(option => option
        .setName('chance_de_reponse_ping')
        .setDescription('Le pourcentage de chance de réponse à un ping')
        .setRequired(false)
      ),
    run: async (inter: ChatInputCommandInteraction) => {
      if (inter.guildId == null) {
        return inter.reply({
          content: `Une erreur est survenue`,
          ephemeral: true
        })
      }

      let reply = 'Les changements suivants ont étés opérés:'
      let numberOfChanges = 0

      /**
       * Chance to answer to "Quoi"
       */

      const percentageQuoi = inter.options.getNumber('chance_de_reponse_quoi', false)

      if (percentageQuoi !== null) {
        if (percentageQuoi < 0 || percentageQuoi > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'quoiAnswerPercentage', percentageQuoi)
        reply += `\n- Le pourcentage de chance de réponse à un "quoi" a été mis à ${percentageQuoi}%`
      }

      /**
       * Chance to answer to "Quoicoubeh"
       */

      const percentageQuoicoubeh = inter.options.getNumber('chance_de_reponse_quoicoubeh', false)

      if (percentageQuoicoubeh !== null) {
        if (percentageQuoicoubeh < 0 || percentageQuoicoubeh > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'quoicoubehAnswerPercentage', percentageQuoicoubeh)
        reply += `\n- Le pourcentage de chance de réponse à un "quoicoubeh" a été mis à ${percentageQuoicoubeh}%`
      }

      /**
       * Chance to answer to "Feur"
       */

      const percentageFeur = inter.options.getNumber('chance_de_reponse_feur', false)

      if (percentageFeur !== null) {
        if (percentageFeur < 0 || percentageFeur > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'feurAnswerPercentage', percentageFeur)
        reply += `\n- Le pourcentage de chance de réponse à un "feur" a été mis à ${percentageFeur}%`
      }

      /**
       * Chance to answer to a Ping
       */

      const percentagePing = inter.options.getNumber('chance_de_reponse_ping', false)

      if (percentagePing !== null) {
        if (percentagePing < 0 || percentagePing > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'mentionAnswerPercentage', percentagePing)
        reply += `\n- Le pourcentage de chance de réponse à un ping a été mis à ${percentagePing}%`
      }

      if (numberOfChanges === 0) {
        reply = 'Aucun changement n\'a été effectué'
      }

      void inter.reply({
        content: reply,
        ephemeral: true
      })
    }
  },
  'get-config': {
    command: new SlashCommandBuilder()
      .setName('get-config')
      .setDescription('Affiche la configuration du bot')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    run: async (inter: ChatInputCommandInteraction) => {
      if (inter.guildId == null) {
        return inter.reply({
          content: `Une erreur est survenue`,
          ephemeral: true
        })
      }

      const quoiAnswerPercentage = getSetting(inter.guildId, 'quoiAnswerPercentage')
      const quoicoubehAnswerPercentage = getSetting(inter.guildId, 'quoicoubehAnswerPercentage')
      const feurAnswerPercentage = getSetting(inter.guildId, 'feurAnswerPercentage')
      const mentionAnswerPercentage = getSetting(inter.guildId, 'mentionAnswerPercentage')

      void inter.reply({
        files: [new AttachmentBuilder('./assets/logo.png').setName('logo.png')],
        embeds: [
          new EmbedBuilder()
            .setTitle('Configuration')
            .setThumbnail('attachment://logo.png')
            .addFields([
              {
                name: 'Chances de réponse...',
                value: '\u200b',
                inline: false
              },
              {
                name: 'à un "quoi"',
                value: `${quoiAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'à un "quoicoubeh"',
                value: `${quoicoubehAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'à un "feur"',
                value: `${feurAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'à un ping',
                value: `${mentionAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'Salons ignorés',
                value: getIgnoredChannels(inter.guildId).map(channel => `<#${channel.channelId}>`).join(', ') || 'Aucuns',
                inline: false
              }
            ])

        ],
        ephemeral: true
      })
    }
  }
}

export default commands
