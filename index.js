(() => {
    var C = Object.create;
    var w = Object.defineProperty;
    var M = Object.getOwnPropertyDescriptor;
    var A = Object.getOwnPropertyNames;
    var R = Object.getPrototypeOf,
        U = Object.prototype.hasOwnProperty;
    var i = (e => typeof require != "undefined" ? require : typeof Proxy != "undefined" ? new Proxy(e, {
        get: (t, o) => (typeof require != "undefined" ? require : t)[o]
    }) : e)(function(e) {
        if (typeof require != "undefined") return require.apply(this, arguments);
        throw new Error('Dynamic require of "' + e + '" is not supported')
    });
    var D = (e, t, o, s) => {
        if (t && typeof t == "object" || typeof t == "function")
            for (let n of A(t)) !U.call(e, n) && n !== o && w(e, n, {
                get: () => t[n],
                enumerable: !(s = M(t, n)) || s.enumerable
            });
        return e
    };
    var m = (e, t, o) => (o = e != null ? C(R(e)) : {}, D(t || !e || !e.__esModule ? w(o, "default", {
        value: e,
        enumerable: !0
    }) : o, e));
    var L = i("dotenv/config"),
        r = i("discord.js"),
        B = i("@colors/colors"),
        S = i("uuid"),
        P = m(i("tmp")),
        O = m(i("axios")),
        E = m(i("fs"));
    var l = {
        log: (...e) => {
            console.log("[LunarSec]".magenta, ...e)
        },
        warn: (...e) => {
            console.warn("[LunarSec]".yellow, ...e)
        },
        error: (...e) => {
            console.error("[LunarSec]".red, ...e)
        }
    };
    var h = m(i("tmp")),
        y = i("child_process");

    function p(e, t) {
        return new Promise((o, s) => {
            let n = h.default.fileSync(),
                a = (0, y.spawn)("./bin/luajit.exe", ["./lua/cli.lua", "--preset", t, e, "--out", n.name]);
            a.stderr.on("data", c => {
                l.error(c.toString()), s(c.toString())
            }), a.on("close", () => {
                o(n)
            })
        })
    }
    var k = process.env.DISCORD_TOKEN;
    l.log("Bot is starting ...");
    var u = new r.Client({
        intents: [r.Intents.FLAGS.DIRECT_MESSAGES, r.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS],
        partials: ["CHANNEL"]
    });
    u.login(k);
    u.once("ready", () => {
        l.log(`Logged in as ${(u.user?.tag||"Unknown").cyan}`)
    });
    var d = new Map;
    u.on("interactionCreate", async e => {
        if (!e.isButton()) return;
        let t = d.get(e.customId);
        if (!t) {
            e.update({
                embeds: [{
                    title: "LunarSec",
                    description: "Error!",
                    color: "#1c73ff"
                }],
                components: []
            });
            return
        }
        let {
            message: o
        } = t;
        e.update({}), console.log(`${(t.tag||"Unknown User").cyan} -> ${t.url} @ ${t.preset}`), await o.edit({
            embeds: [{
                title: "LunarSec",
                description: `Be Patienet..`,
                color: "#1c73ff"
            }],
            components: []
        });
        let s = P.default.fileSync({
                postfix: ".lua"
            }),
            n = await (0, O.default)({
                method: "GET",
                url: t.url,
                responseType: "stream"
            });
        if (n.headers["content-length"] && Number.parseInt(n.headers["content-length"], 10) > 4e4) {
            o.edit({
                embeds: [{
                    title: "LunarSec",
                    description: `The Maximum size is 40KB!`,
                    color: "#ff0000"
                }],
                components: []
            });
            return
        }
        n.data.pipe(E.default.createWriteStream(s.name));
        try {
            await new Promise((f, I) => {
                n.data.on("end", () => {
                    f()
                }), n.data.on("error", () => {
                    I()
                })
            })
        } catch {
            o.edit({
                embeds: [{
                    title: "LunarSec",
                    description: "Error",
                    color: "#ff0000"
                }],
                components: []
            });
            return
        }
        await o.edit({
            embeds: [{
                title: "LunarSec",
                description: `Be Patienet..`,
                color: "#1c73ff"
            }],
            components: []
        });
        let a;
        try {
            a = await p(s.name, t.preset)
        } catch (f) {
            o.edit({
                embeds: [{
                    title: "LunarSec",
                    description: `Error ${f}`,
                    color: "#ff0000"
                }],
                components: []
            });
            return
        }
        await o.edit({
            embeds: [{
                title: "LunarSec",
                description: `Be Patienet..`,
                color: "#1c73ff"
            }],
            components: []
        });
        let c = new r.MessageAttachment(a.name, "LunarSec.lua"),
            g = await o.channel.send({
                files: [c]
            }),
            b = g.attachments.first()?.url;
        if (!b) {
            o.edit({
                embeds: [{
                    title: "LunarSec",
                    description: "Error!",
                    color: "#ff0000"
                }],
                components: []
            });
            return
        }
        g.delete(), await o.edit({
            embeds: [{
                title: "LunarSec",
                description: `[Download File!](${b})`,
                color: "#1c73ff"
            }],
            components: []
        }), a.removeCallback(), s.removeCallback()
    });
    u.on("messageCreate", async e => {
        if (!e.author.bot) {
            let t = e.attachments.first()?.url;
            if (!t) {
                e.reply("Oops! I think you forgot the file.");
                return
            }
            let o = new Array(3).fill(0).map(() => (0, S.v4)()),
                s = new r.MessageActionRow().addComponents(new r.MessageButton().setCustomId(o[0]).setLabel("Basic").setStyle("PRIMARY"), new r.MessageButton().setCustomId(o[1]).setLabel("Secure").setStyle("PRIMARY"), new r.MessageButton().setCustomId(o[2]).setLabel("Mega Secure").setStyle("PRIMARY")),
                n = `Choose the Security Level`,
                a = await e.reply({
                    embeds: [{
                        title: "",
                        color: "#1c73ff",
                        description: n
                    }],
                    components: [s]
                });
            d.set(o[0], {
                url: t,
                preset: "Basic",
                tag: e.author.tag,
                message: a
            }), d.set(o[1], {
                url: t,
                preset: "Secure",
                tag: e.author.tag,
                message: a
            }), d.set(o[2], {
                url: t,
                preset: "Mega Secure",
                tag: e.author.tag,
                message: a
            })
        }
    });
})();