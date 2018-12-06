import english from "./m_en"
import korean from "./m_kr"

export function getMobileLocale(code: string): IText {
    const locale = code.split("-")
    switch (locale[0]) {
        case "en": return english
        case "ko": return korean
        default: return english
    }
}
export interface IText {
    "currency": string
    "currency-symbol": string

    // Languages
    "lang-en": string
    "lang-fr": string
    "lang-sp": string
    "lang-ko": string
    "lang-cs": string
    "lang-ct": string
    "lang-ja": string
    "lang-it": string

    // Buttons
    "btn-get-started": string
    "btn-got-it": string
    "btn-continue": string
    "btn-finish": string
    "btn-create-wallet": string
    "btn-recover-wallet": string
    "btn-confirm": string
    "btn-add": string
    "btn-close": string
    "btn-max": string
    "btn-send": string
    "btn-request": string
    "btn-more": string
    "btn-create-qr": string
    "btn-login": string
    "btn-submit": string
    "btn-cancel": string
    "btn-yes": string

    // PLACEHOLDER / LABEL
    "ph-contact-name": string
    "ph-generated-mnemonic": string
    "ph-enter-mnemonic": string
    "ph-confirm-mnemonic": string
    "ph-wallet-name": string
    "ph-mnemonic-language": string
    "ph-password": string
    "ph-confirm-password": string
    "ph-advanced-options": string
    "ph-bip39": string
    "ph-wallet-address": string
    "ph-wallet-password": string
    "ph-amount": string
    "ph-fee": string
    "ph-amount-to-request": string
    "ph-email": string
    "ph-2fa": string

    // ON BOARDING
    "onboarding-step1-text1": string
    "onboarding-step1-text2": string
    "onboarding-step1-text3": string
    "onboarding-step2-text1": string
    "onboarding-step2-text2": string
    "onboarding-step2-text3": string
    "onboarding-step3-text1": string
    "onboarding-step3-text2": string
    "onboarding-step3-text3": string
    "onboarding-step4-text1": string
    "onboarding-step4-text2": string
    "onboarding-step4-text3": string
    "onboarding-step5-text1": string
    "onboarding-step5-text2": string
    "onboarding-step5-checkbox1": string
    "onboarding-step5-checkbox2": string
    "onboarding-step5-checkbox3": string

    // HOME
    "wallet-list": string
    "home-guide-add-wallet": string
    "home-guide-tap-plus": string

    // CONTACTS
    "contacts-title": string
    "contacts-list": string

    // CREATE / RECOVER WALLET
    "common-title": string
    "common-advanced-options-hint1": string
    "common-advanced-options-hint2": string
    "common-select-create-or-recover": string
    "create-type-mnemonic": string
    "create-what-is-this": string
    "create-answer-what-is-this": string
    "create-retype-mnemonic": string
    "create-success": string
    "recover-type-mnemonic": string
    "recover-success": string

    // WALLET DETIAL
    "detail-no-data": string
    "detail-title": string
    "detail-your-balance": string
    "datail-balance-tooltip": string
    "detail-last": string
    "detail-txs": string
    "detail-amount": string
    "detail-fee": string
    "detail-from": string
    "detail-to": string
    "detail-hash": string
    "detail-guide-make-your-tx": string
    "detail-guide-tap-send-or-request": string
    "detail-share-qr": string
    "detail-request-share-qr": string
    "detail-delete-wallet": string

    // WALLET DETAIL - ACTIVITY
    "activity-title": string
    "activity-txs": string
    "activity-completed": string
    "activity-pending": string
    "activity-received": string
    "activity-sent": string
    "activity-mining-reward": string
    "activity-miner-address": string

    // WALLET DETAIL - SEND HYCON
    "send-hyc-title": string
    "send-hyc-how-it-works": string
    "send-hyc-answer-how-it-works": string
    "send-hyc-tx-status": string
    "send-hyc-success": string
    "send-hyc-fail": string
    "send-hyc-add-contact": string
    "send-hyc-select-address": string
    "send-hyc-add-contact-hint": string

    // WALLET DETAIL - REQUEST HYCON
    "request-hyc-title": string

    // WALLET DETAIL - CLAIM WALLET
    "claim-title": string
    "claim-success": string

    // HELP
    "check-all": string
    "help-notification": string
    "help-comming-soon": string
    "help-copied": string

    // ALERT / CONFIRM
    "confirm-add-address-to-contact": string
    "alert-enter-name": string
    "alert-invalid-name": string
    "alert-enter-address": string
    "alert-invalid-address": string
    "alert-contact-address-duplicate": string
    "alert-wallet-name-no-space": string
    "alert-password-not-match": string
    "confirm-password-null": string
    "alert-wallet-name-duplicate": string
    "alert-mnemonic-not-match": string
    "alert-mnemonic-lang-not-match": string
    "alert-wallet-address-duplicate": string
    "alert-recover-fail": string
    "alert-delete-wallet-fail": string
    "alert-9decimal-amount": string
    "alert-9decimal-fee": string
    "alert-invalid-amount": string
    "alert-insufficient-balance": string
    "alert-invalid-fee": string
    "alert-cannot-send-yourself": string
    "alert-enter-to": string
    "alert-invalid-email": string
    "alert-invalid-password": string
    "alert-enter-password": string
    "alert-claim-fail": string
    "alert-invalid-2fa": string
    "alert-cannot-find-account": string

    // SETTINGS
    "settings-title": string
    "settings-about": string
    "settings-app-version": string
    "settings-copyright": string
    "settings-copyright-hycon": string
    "settings-inquiry": string

    // TERMS OF USE
    "terms-of-use": string
    "terms-of-use-text1": string
    "terms-of-use-subtitle1": string
    "terms-of-use-text2": string
    "terms-of-use-text3": string
    "terms-of-use-text4": string
    "terms-of-use-text5": string
    "terms-of-use-subtitle2": string
    "terms-of-use-text6": string
    "terms-of-use-subtitle3": string
    "terms-of-use-text7": string
    "terms-of-use-subtitle4": string
    "terms-of-use-text8": string
    "terms-of-use-subtitle5": string
    "terms-of-use-text9": string
    "terms-of-use-revision-date": string

    // PRIVACY POLICY
    "privacy-policy": string
    "privacy-policy-intro": string
    "privacy-policy-log-data": string
    "privacy-policy-log-data-content": string
    "privacy-policy-cookies": string
    "privacy-policy-cookies-content1": string
    "privacy-policy-cookies-content2": string
    "privacy-policy-cookies-purpose1": string
    "privacy-policy-cookies-purpose2": string
    "privacy-policy-ga": string
    "privacy-policy-ga-content1": string
    "privacy-policy-ga-content2": string
    "privacy-policy-ga-content3": string
    "privacy-policy-changes": string
    "privacy-policy-changes-content": string
    "privacy-policy-revision-date": string

    // CHANGELOG
    "changelog": string
    "changelog-whats-new": string
    "changelog-100": string
    "changelog-100-content": string
    "changelog-101": string
    "changelog-101-content1": string
    "changelog-101-content2": string
    "changelog-101-content3": string
    "changelog-102": string
    "changelog-102-content1": string
    "changelog-102-content2": string
    "changelog-102-content3": string
    "changelog-102-content4": string
    "changelog-102-content5": string
    "changelog-102-content6": string
    "changelog-102-content7": string
    "changelog-102-content8": string
}
