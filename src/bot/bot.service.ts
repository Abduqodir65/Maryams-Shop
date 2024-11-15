import { Injectable } from '@nestjs/common';
import { Start, Update, Action, Hears, Command } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
@Injectable()
export class BotService {

    async showServicesMenu(ctx: Context, oneTimeKeyboard: boolean = false) {
        await ctx.reply("Xizmatlardan birini tanlang:", {
            reply_markup: {
                keyboard: [
                    [{ text: '📹Video darsliklarni ko\'rish' }, { text: '🤯Super skidkalarni ko\'rish' }],
                    [{ text: '📲Ilovani yuklab olish' }],
                ],
                resize_keyboard: true,
                one_time_keyboard: oneTimeKeyboard,
            },
        });
    }

    @Command('help')
    async helpCommand(ctx: Context) {
        const helpMessage = `
Maryam's Shop botiga xush kelibsiz! 😊

Botdan foydalanish uchun quyidagi komandalar va xizmatlardan foydalanishingiz mumkin:

/start - Botni ishga tushirish va asosiy xizmatlarga kirish uchun foydalaniladi.
/help - Botning imkoniyatlari va komandalar haqida batafsil ma'lumot beradi.
/videos - Video darsliklarni ko'rish imkonini beradi.
/discounts - Chegirmalar haqida ma'lumot beradi.
/download - Ilovani yuklab olish uchun.

Xizmatlar:
1. **Video darsliklarni ko'rish** - Har bir darslikni alohida tanlab ko'rish imkoniyati.
2. **Skidlarni ko'rish** - Chegirmalar va maxsus takliflar haqida ma'lumotlar.
3. **Ilovani yuklab olish** - Shop dasturining ilovasini yuklab olish imkoniyati.

Iltimos, xizmatlardan foydalanish uchun **asosiy menyudan** kerakli tugmani tanlang yoki yuqoridagi komandalarni ishlating.
Agar savollaringiz bo‘lsa, ushbu /help komandani yana ishlatishingiz mumkin.
        `;

        await ctx.reply(helpMessage, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "📹 Video darsliklarni ko'rish", callback_data: 'view_videos' },
                        { text: "🤯 Chegirmalarni ko'rish", callback_data: 'view_discounts' }
                    ],
                    [
                        { text: "📲 Ilovani yuklab olish", callback_data: 'download_app' }
                    ]

                ]
            }
        });
    }

    @Start()
    async startCommand(ctx: Context) {
        await ctx.reply(
            "❗️ Botdan foydalanish uchun quyida keltirilgan kanallarga aʼzo boʻling va ''tekshirish'' tugmasiga bosing. 👇",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "♻️ Kanalga obuna bo'lish", url: 'https://t.me/abduqoodiir' }],
                        [{ text: "✅Tekshirish", callback_data: 'check_subscription' }],
                    ],
                },
            }
        );
    }

    @Command('videos')
    async videosCommand(ctx: Context) {
        await this.onVideoLessons(ctx);
    }

    @Command('discounts')
    async discountsCommand(ctx: Context) {
        await this.onSeeDiscounts(ctx);
    }

    @Command('download')
    async downloadCommand(ctx: Context) {
        await this.onDownloadApp(ctx);
    }

    async checkSubscription(ctx: Context) {
        const channelId = '@abduqoodiir';
        const userId = ctx.from?.id;
        const name = ctx.from?.first_name || 'foydalanuvchi';

        try {
            const member = await ctx.telegram.getChatMember(channelId, userId);
            if (['member', 'administrator', 'creator'].includes(member.status)) {
                await ctx.reply(`👏 ${name}, muvofaqqiyatli obuna bo'lgansiz!`);
                await this.showServicesMenu(ctx);
            } else {
                await ctx.reply("Iltimos, avval kanalga obuna bo'ling❗️❗️", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "Kanalga obuna bo'lish", url: `https://t.me/${channelId.slice(1)}` }],
                            [{ text: "✅ Obunani tekshirish", callback_data: 'check_subscription' }]
                        ]
                    }
                });
            }
        } catch (error) {
            await ctx.reply("Kanalga obuna holatini tekshirishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        }
    }

    @Action('check_subscription')
    async onCheckSubscription(ctx: Context) {
        await this.checkSubscription(ctx);
    }

    @Hears('📹Video darsliklarni ko\'rish')
    async onVideoLessons(ctx: Context) {
        await ctx.reply("Darslardan birini tanlang:", {
            reply_markup: {
                keyboard: [
                    [{ text: '1-dars' }, { text: '2-dars' }],
                    [{ text: '3-dars' }, { text: '4-dars' }],
                    [{ text: '5-dars' }, { text: '6-dars' }],
                    [{ text: '7-dars' }, { text: '8-dars' }],
                    [{ text: '🔙Orqaga' }],
                ],
                resize_keyboard: true,
            },
        });
    }

    @Hears('1-dars')
    async onFirstLesson(ctx: Context) {
        const videoUrl = 'https://drive.google.com/uc?export=download&id=1gu0tp861iFEwu9zfn1VGab4r17UiQHw7';
        const lessonTitle = "Pinduoduo ilovasidan O'zbekiston telefon raqami orqali ro'yxatdan o'tish✅";

        try {
            await ctx.replyWithVideo(videoUrl, {
                caption: lessonTitle,
            });
        } catch (error) {
            await ctx.reply("Video yuborishda xatolik yuz berdi😥. Iltimos qaytatdan urinib ko'ring🙂");
        }
    }

    @Hears('🔙Orqaga')
    async onBack(ctx: Context) {
        await this.showServicesMenu(ctx);
    }

    @Hears('🤯Super skidkalarni ko\'rish')
    async onSeeDiscounts(ctx: Context) {
        await ctx.reply("Skidlarni ko'rish🔥", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Kanalga kirish', url: 'https://t.me/maryams_shop' }],
                ],
            },
        });
    }

    private isSendingFile = false;

    @Hears('📲Ilovani yuklab olish')
    async onDownloadApp(ctx: Context) {
        if (this.isSendingFile) return;

        this.isSendingFile = true;
        const waitingMessage = await ctx.reply("Fayl jo'natilmoqda... Iltimos, kuting.");

        try {
            await ctx.replyWithDocument({ source: '../../downloads/pinduoduo-7-16-0.apk', filename: 'application.apk' });
        } catch (error) {
            await ctx.reply("Fayl jo'natishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        }

        await ctx.deleteMessage(waitingMessage.message_id);
        this.isSendingFile = false;
    }

}
