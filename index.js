require('dotenv').config()
const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const mustifixdb = require("croxydb")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});
// Mustifix uptime botu :)
global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const TOKEN = process.env.TOKEN
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});


client.login(TOKEN)

// Uptime Modal
const mustifixModal = new ModalBuilder()
    .setCustomId('form')
    .setTitle('Link Ekle')
const u2 = new TextInputBuilder()
    .setCustomId('link')
    .setLabel('Proje Linkinizi Giriniz')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(8)
    .setMaxLength(200)
    .setPlaceholder('https://mustifix-code.glitch.me')
    .setRequired(true)

const row1 = new ActionRowBuilder().addComponents(u2);
mustifixModal.addComponents(row1);


const mustifixModal2 = new ModalBuilder()
    .setCustomId('form2')
    .setTitle('Link Sil')
const u3 = new TextInputBuilder()
    .setCustomId('baslik1')
    .setLabel('Proje Linkini Giriniz')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(8)
    .setMaxLength(200)
    .setPlaceholder('https://mustifix-code.glitch.me')
    .setRequired(true)

const row2 = new ActionRowBuilder().addComponents(u3);
mustifixModal2.addComponents(row2);

// Uptime Kanala Gönderme
client.on('interactionCreate', async interaction => {

    if (interaction.commandName === "uptime-ayarla") {

        const row = new Discord.ActionRowBuilder()

            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Ekle")
                    .setStyle(Discord.ButtonStyle.Success)
                    .setCustomId("ekle")
					.setEmoji("<:ekle:1170689812970360852>")
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Sil")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("sil")
					.setEmoji("<:sil:1170689816321605693>")
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Linklerim")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("linklerim")
					.setEmoji("<:link2:1170689820939534476>")
            )

        const server = interaction.guild
        let sistem = mustifixdb.get(`uptimeSistemi_${interaction.guild.id}`)
        if (!sistem) return;
        let channel = sistem.kanal

        const uptimeMesaj = new Discord.EmbedBuilder()
            .setColor("00ffbd")
            .setTitle("SECURE UPTİME SERVİSİ")
            .setDescription("**> 🥳 Uptime sistemimize hoş geldiinn 🥳** \n\n <:yesilok:1170684013963382905>**Ekle** butonuna tıklayarak sistemimize linkinizi __ekleyebilirsin__!\n\n <:maviok:1170684045613596732> **Sil** butonuna tıklayarak sistemimizden linkini __silebilirsin__!\n\n <:yesilok:1170684013963382905> **Linklerim** butonuna tıklayarak linklerine göz atabilirsin!\n\n <:maviok:1170684045613596732> **__Ücretsiz__** şekilde **5**, **__premium__** ile **30** link ekleyebilirsin!\n\n> **İyi Kullanımlarr :)**")
            .setImage("https://cdn.discordapp.com/attachments/1105524120805969952/1170426551251251310/standard_2.gif?ex=6558ffab&is=65468aab&hm=eee9cbdc8a5b797624f1c63efd785c508e34d63efca142661432ab3541eab61a&")
            .setThumbnail(server.iconURL({ dynamic: true }))
            .setFooter({ text: "SECURE UPTİME - By. Mustifix" })

        interaction.guild.channels.cache.get(channel).send({ embeds: [uptimeMesaj], components: [row] })

    }

})

// Uptime Ekle
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "ekle") {

        await interaction.showModal(mustifixModal);
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form') {

        if (!mustifixdb.fetch(`uptimeLinks_${interaction.user.id}`)) {
            mustifixdb.set(`uptimeLinks_${interaction.user.id}`, [])
        }

        const link = interaction.fields.getTextInputValue("link")

        let link2 = mustifixdb.fetch(`uptimeLinks_${interaction.user.id}`, [])

        let sistem = mustifixdb.get(`uptimeSistemi_${interaction.guild.id}`)
        if (!sistem) return;
        let ozelrol = sistem.rol
        let log = sistem.log
        if (!log) return;
        var logChannel = client.channels.cache.get(log)

        if (!link) return;

        if (!interaction.member.roles.cache.has(ozelrol)) {
            if (mustifixdb.fetch(`uptimeLinks_${interaction.user.id}`).length >= 5) {
                return interaction.reply({
                    content: "En fazla 5 link ekleyebilirsin!",
                    ephemeral: true
                }).catch(e => { })
            }
        }
        // Limit ayarları - Mustifix <3
        if (interaction.member.roles.cache.has(ozelrol)) {
            if (mustifixdb.fetch(`uptimeLinks_${interaction.user.id}`).length >= 30) {
                return interaction.reply({
                    content: "En fazla 30 link ekleyebilirsin!",
                    ephemeral: true
                }).catch(e => { })
            }
        }

        if (link2.includes(link)) {
            return interaction.reply({
                content: "Bu link zaten sistemde mevcut!",
                ephemeral: true
            }).catch(e => { })
        }

        if (!link.startsWith("https://")) {
            return interaction.reply({
                content: "Uptime linkin hatalı, lütfen başında `https://` olduğundan emin ol!",
                ephemeral: true
            }).catch(e => { })
        }

        if (!link.endsWith(".glitch.me")) {
            return interaction.reply({
                content: "Uptime linkin hatalı, lütfen sonunda `.glitch.me` olduğundan emin ol!",
                ephemeral: true
            }).catch(e => { })
        }

        if (link.includes("uptime")) {

            const logEmbed = new EmbedBuilder()
                .setColor("ff0000")
                .setDescription(`<@${interaction.user.id}> adlı kullanıcı sisteme **uptime botu** eklemeye çalıştı!`)

            logChannel.send({ embeds: [logEmbed] }).catch(e => { })

            return interaction.reply({
                content: "Sistemimize uptime botu ekleyemezsin!",
                ephemeral: true
            }).catch(e => { })
        }


        mustifixdb.push(`uptimeLinks_${interaction.user.id}`, link)
        mustifixdb.push(`uptimeLinks`, link)
        interaction.reply({
            content: "Linkin başarıyla uptime sistemine eklendi!",
            ephemeral: true
        }).catch(e => { })
		var links = await mustifixdb.fetch(`uptimeLinks_${interaction.user.id}`);
        const logEmbed = new EmbedBuilder()
            .setColor("00ff0c")
            .setDescription(`<@${interaction.user.id}> adlı kullanıcı sisteme bir link ekledi!\n\n Sistemdeki link sayısı **${links.length}** \n\n`)
			.setImage("https://cdn.discordapp.com/attachments/1105524120805969952/1170422555224576100/standard.gif?ex=6558fbf2&is=654686f2&hm=a6f98e75226c8e5596a5e935cfad597aedf0c9d1602fb42ceaf729603038ca7f&")
        logChannel.send({ embeds: [logEmbed] }).catch(e => { })
    }
})


// Uptime Sil
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "sil") {

        await interaction.showModal(mustifixModal2);
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form2') {

        let sistem = mustifixdb.get(`uptimeSistemi_${interaction.guild.id}`)
        if (!sistem) return;
        let log = sistem.log
        if (!log) return;
        var logChannel = client.channels.cache.get(log)

        const links = mustifixdb.get(`uptimeLinks_${interaction.user.id}`)
        let linkInput = interaction.fields.getTextInputValue("baslik1")

        if (!links.includes(linkInput)) return interaction.reply({ content: "Sistemde böyle bir link mevcut değil!", ephemeral: true }).catch(e => { })

        mustifixdb.unpush(`uptimeLinks_${interaction.user.id}`, linkInput)
        mustifixdb.unpush(`uptimeLinks`, linkInput)

        interaction.reply({ content: "Linkin başarıyla sistemden silindi!", ephemeral: true }).catch(e => { })

        const logEmbed = new EmbedBuilder()
            .setColor("ff0000")
            .setDescription(`<@${interaction.user.id}> adlı kullanıcı sistemden bir **link sildi!**\n\n Sistemde kalan link sayısı **'.length'** \n\n :link: Link:`)
			.setImage("https://cdn.discordapp.com/attachments/1105524120805969952/1170422555811795065/standard_1.gif?ex=6558fbf2&is=654686f2&hm=47ee81e75b57ee46879e430905d54f17625daa673ab016783cbefcd14cb16a11&")
        logChannel.send({ embeds: [logEmbed] }).catch(e => { })
    }
})
// Mustifix :D

// Linklerim
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "linklerim") {

        const rr = mustifixdb.get(`uptimeLinks_${interaction.user.id}`)
        if (!rr) return interaction.reply({ content: "Sisteme eklenmiş bir linkin yok!", ephemeral: true })

        const links = mustifixdb.get(`uptimeLinks_${interaction.user.id}`).map(map => `▶️ \`${map}\` `).join("\n")

        const linklerimEmbed = new EmbedBuilder()
            .setTitle(`Uptime Linklerin`)
            .setDescription(`${links || "Sisteme eklenmiş bir link yok!"}`)
            .setFooter({ text: "SECURE UPTİME" })
            .setColor("ff0052")

        interaction.reply({
            embeds: [linklerimEmbed],
            ephemeral: true
        }).catch(e => { })

    }
})