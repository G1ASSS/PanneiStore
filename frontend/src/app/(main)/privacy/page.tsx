'use client';

import { Shield, Lock, Eye, FileText, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  return (
    <div className="diamonds-page">
      {/* Header */}
      <div className="diamonds-hero">
        <div className="diamonds-hero-bg">
          <div className="diamond-float d1 text-brand-pink/60 drop-shadow-[0_0_15px_rgba(255,46,147,0.5)]"><Shield size={44} className="fill-brand-pink" strokeWidth={1.5} /></div>
          <div className="diamond-float d2 text-brand-purple/50 drop-shadow-[0_0_15px_rgba(161,44,255,0.4)]"><Lock size={36} className="fill-brand-purple" strokeWidth={1.5} /></div>
          <div className="diamond-float d3 text-brand-cyan/60 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]"><Eye size={40} className="fill-brand-cyan" strokeWidth={1.5} /></div>
        </div>
        <h1 className="diamonds-title flex items-center justify-center gap-3">
          {t("Privacy Policy", "ကိုယ်ရေးကိုယ်တာလုံခြုံမှု မူဝါဒ")}
        </h1>
        <p className="diamonds-subtitle">{t("Your privacy and security are our top priorities.", "သင်၏ လုံခြုံရေးနှင့် ကိုယ်ရေးကိုယ်တာလုံခြုံမှုသည် ကျွန်ုပ်တို့၏ အဓိက ဦးစားပေးဖြစ်သည်။")}</p>
      </div>

      <div className="diamonds-body" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '120px' }}>
        
        {/* Section 1 */}
        <div className="diamonds-section">
          <h2 className="section-heading">
            <span className="step-num"><Eye size={18} /></span> {t("Information We Collect", "ကျွန်ုပ်တို့ ကောက်ယူသည့် အချက်အလက်များ")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>{t("When you use PanneiStore to buy or sell Mobile Legends accounts, or to top up diamonds, we collect the necessary information to process your transactions securely:", "Mobile Legends အကောင့်များ ရောင်းဝယ်ရန် သို့မဟုတ် စိန်ဖြည့်ရန် PanneiStore ကို အသုံးပြုသောအခါ သင့်၏ လုပ်ဆောင်မှုများ လုံခြုံစေရန် လိုအပ်သော အချက်အလက်များကို ကျွန်ုပ်တို့ ကောက်ယူပါသည်။")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="theme-heading">{t("Account Information:", "အကောင့် အချက်အလက်-")}</strong> {t("Your name, email address, phone number, and PanneiStore account credentials.", "သင့်အမည်၊ အီးမေးလ်၊ ဖုန်းနံပါတ်နှင့် PanneiStore အကောင့် အချက်အလက်များ။")}</li>
              <li><strong className="theme-heading">{t("Game Data:", "ဂိမ်း အချက်အလက်-")}</strong> {t("Your Mobile Legends User ID and Server ID when purchasing diamond top-ups.", "စိန်ဖြည့်သည့်အခါ လိုအပ်သော သင်၏ Mobile Legends User ID နှင့် Server ID။")}</li>
              <li><strong className="theme-heading">{t("Transaction Data:", "ငွေပေးချေမှု အချက်အလက်-")}</strong> {t("Details of your purchases, escrow agreements, and payment method identifiers.", "သင်၏ ဝယ်ယူမှု အသေးစိတ်များ၊ ကြားခံဝန်ဆောင်မှု သဘောတူညီချက်များနှင့် ငွေပေးချေမှုဆိုင်ရာ အချက်အလက်များ။")}</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><Lock size={18} /></span> {t("How We Protect Your Data", "သင့်အချက်အလက်များကို မည်သို့ ကာကွယ်သနည်း")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>{t("Security is the foundation of our escrow platform. We implement industry-standard security measures to ensure your data is safe:", "လုံခြုံရေးသည် ကျွန်ုပ်တို့၏ ကြားခံဝန်ဆောင်မှု၏ အဓိက အုတ်မြစ်ဖြစ်သည်။ သင့်အချက်အလက်များ လုံခြုံစေရန် စံနှုန်းပြည့်မီသော လုံခြုံရေးစနစ်များကို ကျွန်ုပ်တို့ အသုံးပြုထားပါသည်။")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("All payment transactions are encrypted and processed through verified local payment gateways.", "ငွေပေးချေမှုများအားလုံးကို စစ်ဆေးအတည်ပြုပြီးသော ပြည်တွင်း ငွေပေးချေမှု စနစ်များမှတစ်ဆင့် လုံခြုံစွာ လုပ်ဆောင်ပါသည်။")}</li>
              <li>{t("We never store your full financial credentials or game account passwords directly on our servers without heavy encryption.", "သင်၏ ငွေပေးချေမှု အချက်အလက်အပြည့်အစုံ သို့မဟုတ် ဂိမ်းအကောင့် စကားဝှက်များကို ခိုင်မာသော ကုဒ်ဝှက်စနစ်မပါဘဲ ကျွန်ုပ်တို့၏ ဆာဗာများတွင် သိမ်းဆည်းထားခြင်း မရှိပါ။")}</li>
              <li>{t("Strict access controls are in place to ensure only authorized support staff can view your transaction details during a dispute.", "အငြင်းပွားမှု ဖြစ်ပွားချိန်တွင် ခွင့်ပြုချက်ရရှိထားသော ဝန်ထမ်းများမှသာ သင့်ငွေပေးချေမှု အသေးစိတ်ကို ကြည့်ရှုနိုင်ရန် တင်းကျပ်သော ကန့်သတ်ချက်များ ပြုလုပ်ထားပါသည်။")}</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="diamonds-section mt-12">
          <h2 className="section-heading">
            <span className="step-num"><FileText size={18} /></span> {t("How We Use Your Information", "သင့်အချက်အလက်များကို မည်သို့ အသုံးပြုသနည်း")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-4 pl-2 md:pl-12">
            <p>{t("We only use your information to provide and improve our services:", "ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများ ပေးအပ်ရန်နှင့် ပိုမိုကောင်းမွန်လာစေရန်အတွက်သာ သင်၏ အချက်အလက်များကို အသုံးပြုပါသည်။")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t("To facilitate secure account trading and diamond top-ups.", "လုံခြုံသော အကောင့်အရောင်းအဝယ်နှင့် စိန်ဖြည့်ခြင်းများ လုပ်ဆောင်ရန်။")}</li>
              <li>{t("To provide customer support and resolve escrow disputes via Telegram or our built-in ticketing system.", "Telegram သို့မဟုတ် ကျွန်ုပ်တို့၏ စနစ်မှတစ်ဆင့် ဝန်ဆောင်မှုပေးရန်နှင့် အငြင်းပွားမှုများကို ဖြေရှင်းပေးရန်။")}</li>
              <li>{t("To notify you about important updates, security alerts, and promotional offers.", "အရေးကြီးသော အသိပေးချက်များ၊ လုံခြုံရေး သတိပေးချက်များနှင့် ပရိုမိုးရှင်းများ အကြောင်းကြားရန်။")}</li>
            </ul>
            <p className="mt-6 text-brand-pink font-semibold">
              {t("We will never sell, rent, or share your personal information with third parties for marketing purposes.", "သင်၏ ကိုယ်ရေးအချက်အလက်များကို မားကတ်တင်းအတွက် အခြားပြင်ပအဖွဲ့အစည်းများသို့ ရောင်းချခြင်း၊ ငှားရမ်းခြင်း သို့မဟုတ် မျှဝေခြင်းများ မည်သည့်အခါမျှ ပြုလုပ်မည်မဟုတ်ပါ။")}
            </p>
          </div>
        </div>

        {/* Section 4 / Contact */}
        <div className="diamonds-section mt-12 mb-8">
          <h2 className="section-heading">
            <span className="step-num"><MessageSquare size={18} /></span> {t("Questions about your privacy?", "ကိုယ်ရေးကိုယ်တာလုံခြုံမှုနှင့် ပတ်သက်၍ မေးမြန်းလိုပါသလား။")}
          </h2>
          <div className="theme-muted text-[15px] leading-relaxed space-y-6 pl-2 md:pl-12">
            <p>
              {t("If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to reach out to our support team.", "ဤမူဝါဒ သို့မဟုတ် အချက်အလက်များ ကိုင်တွယ်ပုံနှင့် ပတ်သက်၍ မေးမြန်းလိုပါက ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုအဖွဲ့ထံသို့ ဆက်သွယ်နိုင်ပါသည်။")}
            </p>
            <div>
              <a 
                href="https://t.me/panneisan2002" 
                target="_blank" 
                rel="noreferrer"
                className="hero-cta hero-cta-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px]"
              >
                <MessageSquare size={16} className="fill-brand-pink/20" /> {t("Contact Support on Telegram", "Telegram တွင် ဆက်သွယ်ရန်")}
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-24 pt-12 border-t border-[var(--card-border)]/50">
          <p className="theme-muted text-[14px]">
            {t("Last updated on", "နောက်ဆုံးပြင်ဆင်ခဲ့သော ရက်စွဲ -")} <span className="font-medium theme-heading">{new Date().toLocaleDateString(t('en-US', 'my-MM'), { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
