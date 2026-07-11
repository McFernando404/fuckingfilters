// Type-safe translation dictionaries.
// `Dict` is derived from the English source so both locales are checked
// at compile time. English is the default locale.

export type Locale = "en" | "es";

export const en = {
  nav: {
    privacy: "Privacy",
    models: "Models",
    how: "How it works",
    chat: "Chat",
    ariaLabel: "Main",
    skipToContent: "Skip to content",
  },
  toggles: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
    languageAria: "Switch language",
  },
  hero: {
    badge: "No filters · No logs · No babysitting",
    titleA: "Tired of filters?",
    titleB: "Talk like an adult.",
    subtitle:
      "Uncensored, filter-free AI — stop being treated like a child. Say what you actually think on models that don't lecture you. We store no chats, no emails, no passwords: only an anonymous account code. Payments are Monero-only, for total privacy.",
    primary: "Create free account",
    secondary: "Try as guest",
    goToChat: "Open chat",
    myAccount: "My account",
    note: "No filters. No email. No tracking.",
    chipFiltered: "Filtered",
    chipUncensored: "Uncensored",
    chipCode: "Code",
  },
  privacy: {
    tag: "Zero storage",
    title: "We store nothing. Seriously.",
    subtitle:
      "The only thing we keep is your anonymous account code — everything else is ephemeral or never collected in the first place.",
    items: [
      {
        t: "Only an account code",
        d: "A randomly generated code. No username, no email, no password — ever.",
      },
      {
        t: "No IP addresses",
        d: "We never log or store your IP. Device-based anti-abuse uses an Argon2id hash, which is one-way and irreversible.",
      },
      {
        t: "No chats, no content",
        d: "Conversations live in your browser session and are never written to disk on our side.",
      },
      {
        t: "Monero-only",
        d: "No Stripe, no cards, no processors that track you. Donations are optional and only raise your daily limits.",
      },
    ],
  },
  models: {
    tag: "Models",
    title: "A model for every case",
    subtitle:
      "Models that don't babysit you. Filtered options exist if you want them — but the point is the unfiltered ones. Use what you need, like an adult. (Illustrative — final models may change.)",
    items: [
      { name: "FF-Speed v1.0", d: "Lightweight, fast and fully uncensored. Great for everyday chat. 8K context.", badge: "Fast" },
      { name: "FF-Speed Thinking v1.0", d: "Thinks and reasons step-by-step before answering. Fully uncensored. 8K context.", badge: "Thinking" },
      { name: "Qwen2.5 Coder 3B", d: "Specialized in code — writes, explains and debugs. Fully uncensored. 16K context.", badge: "Code" },
    ],
  },
  how: {
    tag: "How it works",
    title: "Private in four steps",
    steps: [
      { t: "Create your account", d: "Get an anonymous code — that is your only credential." },
      { t: "Pick a model", d: "Choose filtered, uncensored, or code, depending on what you need." },
      { t: "Chat freely", d: "Your conversation stays in your session. Nothing is saved server-side." },
      { t: "Optional: support us", d: "Donate any amount in Monero to raise your daily limits." },
    ],
  },
  cta: {
    title: "Ready to drop the filters?",
    subtitle:
      "Create an anonymous account in seconds — no email, no password, no tracking, no lectures.",
    primary: "Create free account",
    secondary: "Try as guest",
  },
  footer: {
    tagline: "Uncensored AI. Speak like an adult.",
    rights: "All rights reserved.",
    status: "End-to-end private. No account.",
    navLabel: "Footer",
    badges: ["No logs", "No email", "No tracking"],
    links: { privacy: "Privacy", models: "Models", how: "How it works", terms: "Terms", privacyPolicy: "Privacy Policy" },
  },
  account: {
    title: "Create your account",
    subtitle:
      "We generate a random 128-character key — it is your only credential. No email, no password. Regenerate it if you want, then accept.",
    yourCode: "Your account key",
    regenerate: "Regenerate",
    copy: "Copy",
    copied: "Copied",
    accept: "Accept & continue",
    cancel: "Cancel",
    persistError:
      "Couldn't save the key in this browser (private mode or storage disabled). Copy it now — it can't be recovered later.",
    persistContinue: "I copied it, continue",
    storageWarning:
      "Storage is full — your latest profile change couldn't be saved.",
    avatarError: "That image couldn't be loaded. Try a smaller JPG or PNG.",
    noteLocal:
      "For now this key is stored only in this browser (localStorage). An external database is coming later.",
    myAccount: "My account",
    signedInAs: "Signed in",
    guest: "Guest",
    guestInfo: "You're chatting as a guest. Create an account to keep your key and limits.",
    logout: "Log out",
    apiKey: "API key",
    limits: "Usage limits",
    dailyLimit: "Daily limit",
    weeklyLimit: "Weekly limit",
    monthlyLimit: "Monthly limit",
    comingSoon: "Soon",
    donate: "Donate",
    buyLicense: "Buy license",
    buyOrDonate: "Buy / Donate",
    buyOrDonateNote: "Monero-only · Coming soon",
    viewTitle: "My account",
    viewSubtitle:
      "Your anonymous account, profile and usage — stored only in this browser.",
    profileSection: "Profile",
    displayName: "Display name",
    displayNamePlaceholder: "Add a name to show",
    changeAvatar: "Change image",
    removeAvatar: "Remove",
    avatarHint: "Stored only in this browser. Square images work best.",
    usageSection: "Usage",
    memberSince: "Member since",
    dailyUsage: "Messages today",
    tokensUsed: "Tokens used",
    messagesStat: "Messages",
    conversationsStat: "Conversations",
    estimated: "Estimated",
    limitsNote: "Per-account limits appear here once the backend is connected.",
    guestTitle: "You're not signed in",
    guestBody: "Create an anonymous account to view your profile and usage.",
    backToChat: "Back to chat",
    backToHome: "Back to home",
    showKey: "Show",
    hideKey: "Hide",
    acceptIntro: "I have read and accept the ",
    acceptMid: " and the ",
    acceptOutro: ".",
    termsLink: "Terms of Use",
    privacyLink: "Privacy Policy",
  },
  login: {
    title: "Log in with your key",
    subtitle:
      "Paste the account key you saved to restore your account on this browser.",
    placeholder: "aiu-key-…",
    submit: "Log in",
    error: "That doesn't look like a valid F*ckingFilters key.",
    persistWarn:
      "Couldn't save this browser session (private mode or storage disabled). You'll need to paste your key again next time.",
    button: "Log in",
  },
  chat: {
    title: "Chat",
    newChat: "New chat",
    placeholder: "Send a message…",
    modelLabel: "Model",
    chooseModel: "Choose a model",
    replyingWith: "Replying with",
    emptyTitle: "Say something — we won't filter it.",
    emptySubtitle:
      "Pick a model and talk freely. No filters, no lectures. Your chats stay in your browser.",
    demoReply:
      "This is a preview — no model is connected yet. Once a backend (for example Ollama) is wired up, real replies will stream here.",
    errorReply:
      "⚠️ The model is unavailable right now. Please try again in a moment.",
    you: "You",
    assistant: "Assistant",
    history: "History",
    delete: "Delete",
    noHistory: "No conversations yet",
    back: "Back to home",
    send: "Send",
    guestBadge: "Guest",
    accountBadge: "Account",
    previewBadge: "Uncensored · No filters · FF-Speed v1.0",
    modelDesc: "Lightweight, fast and fully uncensored — talk freely, without filters.",
    modelDescThinking: "Thinks and reasons step-by-step before answering — same uncensored model.",
    modelDescCoder: "Specialized in code — writes, explains, refactors and debugs in any language, fully uncensored.",
    storageWarning:
      "A problem with saved chats (storage full or unreadable) — some may be missing.",
    dismiss: "Dismiss",
    typing: "Assistant is typing…",
    thinking: "Thinking…",
    online: "Online",
    offline: "Offline",
    suggestions: "Start with a model",
    tierFiltered: "Filtered",
    tierUncensored: "Uncensored",
    tierCode: "Code",
    tierFast: "Fast",
    tierThinking: "Thinking",
    lockedTitle: "Create an account to chat",
    lockedBody:
      "Chat is only available with a free, anonymous account — no email, no password, just a code.",
  },
  legal: {
    back: "Back to home",
    updated: "Last updated: 2026-07-07",
    termsTitle: "Terms of Use",
    termsIntro:
      "These Terms of Use govern your use of F*ckingFilters. By creating an account or using the service you agree to them. Please read them carefully.",
    terms: [
      {
        h: "A neutral service",
        p: "F*ckingFilters is a neutral platform that offers uncensored, filter-free AI models — including a model specialized in code. We do not create, endorse, verify, or control what the models output. Output may be inaccurate, incomplete, biased, or offensive. You must use your own judgment and verify anything important.",
      },
      {
        h: "You are responsible for how you use it",
        p: "F*ckingFilters is only a tool. Its owner and operators provide the service, but do not control, supervise, or assume responsibility for how you choose to use it or for what you do with the models' output. All responsibility for how the service is used falls entirely on you, the user — never on the owner or operators of F*ckingFilters. By using the service you confirm that you understand what it is and that it is your responsibility to know how to use it.",
      },
      {
        h: "Free service and usage limits",
        p: "The service is currently free. To keep it sustainable and fair, each account has usage limits (for example, a number of messages or tokens per day, week, or month). These limits exist now and may be lower or different while the project remains free.",
      },
      {
        h: "We can change anything at any time",
        p: "Because the service is free, we reserve the right to modify, add, remove, limit, suspend, or discontinue any part of the service — including models, features, limits, and availability — at any time, with or without notice, and without any obligation or liability to you.",
      },
      {
        h: "Your anonymous account",
        p: "Your only credential is a randomly generated, anonymous account code. There is no email, username, or password. You are responsible for keeping your code safe; we cannot recover or reset a lost code. Accounts are personal and non-transferable.",
      },
      {
        h: "Accounts expire after 7 days of inactivity",
        p: "To protect privacy and free up resources, any account that is not used for 7 days is permanently and automatically deleted, together with its usage counters. Use your account periodically if you want to keep it.",
      },
      {
        h: "Acceptable use",
        p: "You agree not to abuse the service, not to try to bypass limits or payments, not to overload the infrastructure, not to create accounts automatically at scale, and not to use the service for anything illegal or harmful. We may restrict, suspend, or block access to protect the service or other users.",
      },
      {
        h: "No warranty",
        p: 'The service is provided "as is" and "as available", without warranties of any kind, express or implied. We do not guarantee that the service will be available, uninterrupted, accurate, error-free, or fit for any particular purpose.',
      },
      {
        h: "Limitation of liability",
        p: "To the maximum extent permitted by law, F*ckingFilters and its operators are not liable for any direct, indirect, incidental, or consequential damages arising from your use of, or inability to use, the service.",
      },
      {
        h: "Changes to these Terms",
        p: "We may update these Terms at any time. The date above reflects the latest version. Continuing to use the service after any change means you accept the updated Terms.",
      },
      {
        h: "Optional donations",
        p: "Support through Monero donations is completely optional and may raise your usage limits as a thank-you. Donations are voluntary and, unless required by law, non-refundable.",
      },
    ],
    privacyTitle: "Privacy Policy",
    privacyIntro:
      "This Privacy Policy explains, plainly, what we store and what we do not. The short version: we store almost nothing — only your anonymous account code and the counters needed to enforce your usage limits.",
    privacy: [
      {
        h: "What we store",
        p: "We store only two things: (1) your anonymous account code, and (2) the per-account usage counters required to enforce usage limits. That is all. No personal data is attached to an account.",
      },
      {
        h: "No personal data",
        p: "We never ask for, receive, or store your name, email address, phone number, password, or any other personal identifier. There is simply no field for it.",
      },
      {
        h: "Zero logs (0 logs)",
        p: "We do not keep access logs, IP logs, request logs, error logs, or analytics tied to you. We operate on a strict zero-logs basis.",
      },
      {
        h: "No IP addresses",
        p: "We never log or store your IP address. Abuse prevention is based on a one-way Argon2id hash derived from device and browser data. A hash is mathematically irreversible: it cannot be turned back into your identity and does not count as personal data.",
      },
      {
        h: "Your chats never leave your browser",
        p: "Your conversations are stored only in your browser (localStorage). They are not sent to or persisted on our servers. Even when a backend is connected, the plan is to persist only usage counters — never chat content.",
      },
      {
        h: "Accounts auto-delete after 7 days",
        p: "If an account is not used for 7 days, it is automatically and permanently deleted, along with its usage counters. We do not keep inactive data.",
      },
      {
        h: "Payments are Monero-only",
        p: "We only accept Monero. We never see or store card numbers, names, billing addresses, or any financial identifier. This protects your privacy by design.",
      },
      {
        h: "Cookies and local storage",
        p: "We use minimal local storage for your preferences (theme and language), your account code, and your chats. We do not use tracking, advertising, or third-party analytics cookies.",
      },
      {
        h: "Your rights",
        p: "Because we hold no personal data about you, there is no personal data to sell, share, or exploit. You can erase everything instantly by clearing your browser storage, or simply let your account expire.",
      },
      {
        h: "Account codes are unique by design",
        p: "Account codes are generated with 128 characters of cryptographically secure randomness from a 57-symbol alphabet — a space of roughly 10^225 possible codes. The chance of two accounts ever colliding is effectively zero, far beyond any realistic scale, so a generated code will not match another user's.",
      },
      {
        h: "Not intended for minors",
        p: "The service is not directed at children and is not intended for use by minors.",
      },
      {
        h: "Changes to this Policy",
        p: "We may update this Privacy Policy at any time. The date above reflects the latest version. Continued use after any change means you accept the update.",
      },
    ],
  },
};

export type Dict = typeof en;

export const es: Dict = {
  nav: {
    privacy: "Privacidad",
    models: "Modelos",
    how: "Cómo funciona",
    chat: "Chat",
    ariaLabel: "Principal",
    skipToContent: "Saltar al contenido",
  },
  toggles: {
    toLight: "Cambiar a modo claro",
    toDark: "Cambiar a modo oscuro",
    languageAria: "Cambiar idioma",
  },
  hero: {
    badge: "Sin filtros · Sin registros · Sin niñera",
    titleA: "¿Harto de los filtros?",
    titleB: "Habla como adulto.",
    subtitle:
      "IA sin censura y sin filtros — basta de que te traten como niño. Di lo que piensas de verdad en modelos que no te regañan. No guardamos chats, ni correos, ni contraseñas: solo un código de cuenta anónimo. Los pagos son solo en Monero, para una privacidad total.",
    primary: "Crear cuenta gratis",
    secondary: "Probar como invitado",
    goToChat: "Abrir chat",
    myAccount: "Mi cuenta",
    note: "Sin filtros. Sin correo. Sin rastreo.",
    chipFiltered: "Con filtro",
    chipUncensored: "Sin filtro",
    chipCode: "Código",
  },
  privacy: {
    tag: "Cero almacenamiento",
    title: "No guardamos nada. En serio.",
    subtitle:
      "Lo único que conservamos es tu código de cuenta anónimo — todo lo demás es efímero o nunca se recoge.",
    items: [
      {
        t: "Solo un código de cuenta",
        d: "Un código generado al azar. Sin usuario, sin correo, sin contraseña — nunca.",
      },
      {
        t: "Sin direcciones IP",
        d: "Nunca registramos ni guardamos tu IP. El antibot por dispositivo usa un hash Argon2id, unidireccional e irreversible.",
      },
      {
        t: "Sin chats, sin contenido",
        d: "Las conversaciones viven en la sesión de tu navegador y nunca se guardan en disco de nuestro lado.",
      },
      {
        t: "Solo Monero",
        d: "Nada de Stripe, tarjetas ni procesadores que te rastreen. Las donaciones son opcionales y solo aumentan tus límites diarios.",
      },
    ],
  },
  models: {
    tag: "Modelos",
    title: "Un modelo para cada caso",
    subtitle:
      "Modelos que no te tratan como niño. Hay opciones con filtro si las quieres — pero la gracia son los sin filtro. Usa lo que necesites, como adulto. (Ilustrativo — los modelos finales pueden cambiar.)",
    items: [
      { name: "FF-Speed v1.0", d: "Ligero, rápido y totalmente sin censura. Ideal para charla diaria. Contexto 8K.", badge: "Rápido" },
      { name: "FF-Speed Thinking v1.0", d: "Piensa y razona paso a paso antes de responder. Sin censura. Contexto 8K.", badge: "Razonamiento" },
      { name: "Qwen2.5 Coder 3B", d: "Especializado en código — escribe, explica y depura. Sin censura. Contexto 16K.", badge: "Código" },
    ],
  },
  how: {
    tag: "Cómo funciona",
    title: "Privado en cuatro pasos",
    steps: [
      { t: "Crea tu cuenta", d: "Consigue un código anónimo — es tu única credencial." },
      { t: "Elige un modelo", d: "Filtra, sin filtro o de código, según lo que necesites." },
      { t: "Conversa libremente", d: "Tu conversación se queda en tu sesión. Nada se guarda en el servidor." },
      { t: "Opcional: apóyanos", d: "Dona cualquier monto en Monero para aumentar tus límites diarios." },
    ],
  },
  cta: {
    title: "¿Listo para soltar los filtros?",
    subtitle:
      "Crea una cuenta anónima en segundos — sin correo, sin contraseña, sin rastreo, sin regaños.",
    primary: "Crear cuenta gratis",
    secondary: "Probar como invitado",
  },
  footer: {
    tagline: "IA sin censura. Habla como adulto.",
    rights: "Todos los derechos reservados.",
    status: "Privada de extremo a extremo. Sin cuenta.",
    navLabel: "Pie de página",
    badges: ["Sin registros", "Sin correo", "Sin rastreo"],
    links: { privacy: "Privacidad", models: "Modelos", how: "Cómo funciona", terms: "Términos", privacyPolicy: "Política de privacidad" },
  },
  account: {
    title: "Crea tu cuenta",
    subtitle:
      "Generamos una clave aleatoria de 128 caracteres — es tu única credencial. Sin correo, sin contraseña. Regénérala si quieres y acéptala.",
    yourCode: "Tu clave de cuenta",
    regenerate: "Regenerar",
    copy: "Copiar",
    copied: "Copiado",
    accept: "Aceptar y continuar",
    cancel: "Cancelar",
    persistError:
      "No se pudo guardar la clave en este navegador (modo privado o almacenamiento desactivado). Cópiala ahora — no se podrá recuperar después.",
    persistContinue: "Ya la copié, continuar",
    storageWarning:
      "Almacenamiento lleno — tu último cambio de perfil no se pudo guardar.",
    avatarError: "Esa imagen no se pudo cargar. Prueba un JPG o PNG más pequeño.",
    noteLocal:
      "Por ahora esta clave se guarda solo en este navegador (localStorage). Más adelante vendrá una base de datos externa.",
    myAccount: "Mi cuenta",
    signedInAs: "Sesión iniciada",
    guest: "Invitado",
    guestInfo: "Estás chateando como invitado. Crea una cuenta para guardar tu clave y tus límites.",
    logout: "Cerrar sesión",
    apiKey: "Clave API",
    limits: "Límites de uso",
    dailyLimit: "Límite diario",
    weeklyLimit: "Límite semanal",
    monthlyLimit: "Límite mensual",
    comingSoon: "Pronto",
    donate: "Donar",
    buyLicense: "Comprar licencia",
    buyOrDonate: "Comprar / Donar",
    buyOrDonateNote: "Solo Monero · Próximamente",
    viewTitle: "Mi cuenta",
    viewSubtitle:
      "Tu cuenta anónima, perfil y uso — solo en este navegador.",
    profileSection: "Perfil",
    displayName: "Nombre para mostrar",
    displayNamePlaceholder: "Añade un nombre para mostrar",
    changeAvatar: "Cambiar imagen",
    removeAvatar: "Quitar",
    avatarHint: "Se guarda solo en este navegador. Mejor imágenes cuadradas.",
    usageSection: "Uso",
    memberSince: "Miembro desde",
    dailyUsage: "Mensajes hoy",
    tokensUsed: "Tokens usados",
    messagesStat: "Mensajes",
    conversationsStat: "Conversaciones",
    estimated: "Estimado",
    limitsNote: "Los límites por cuenta aparecerán aquí cuando se conecte el backend.",
    guestTitle: "No has iniciado sesión",
    guestBody: "Crea una cuenta anónima para ver tu perfil y tu uso.",
    backToChat: "Volver al chat",
    backToHome: "Volver al inicio",
    showKey: "Mostrar",
    hideKey: "Ocultar",
    acceptIntro: "He leído y acepto los ",
    acceptMid: " y la ",
    acceptOutro: ".",
    termsLink: "Términos de uso",
    privacyLink: "Política de privacidad",
  },
  login: {
    title: "Entrar con tu clave",
    subtitle:
      "Pega la clave de cuenta que guardaste para restaurar tu cuenta en este navegador.",
    placeholder: "aiu-key-…",
    submit: "Entrar",
    error: "Eso no parece una clave válida de F*ckingFilters.",
    persistWarn:
      "No se pudo guardar la sesión en este navegador (modo privado o almacenamiento desactivado). Tendrás que pegar la clave la próxima vez.",
    button: "Entrar",
  },
  chat: {
    title: "Chat",
    newChat: "Nuevo chat",
    placeholder: "Escribe un mensaje…",
    modelLabel: "Modelo",
    chooseModel: "Elige un modelo",
    replyingWith: "Respondiendo con",
    emptyTitle: "Di algo — no lo vamos a filtrar.",
    emptySubtitle:
      "Elige un modelo y habla libre. Sin filtros, sin regaños. Tus chats se quedan en tu navegador.",
    demoReply:
      "Esto es una vista previa — aún no hay ningún modelo conectado. Cuando se conecte un backend (por ejemplo Ollama), las respuestas reales aparecerán aquí.",
    errorReply:
      "⚠️ El modelo no está disponible en este momento. Inténtalo de nuevo en un momento.",
    you: "Tú",
    assistant: "Asistente",
    history: "Historial",
    delete: "Borrar",
    noHistory: "Aún no hay conversaciones",
    back: "Volver al inicio",
    send: "Enviar",
    guestBadge: "Invitado",
    accountBadge: "Cuenta",
    previewBadge: "Sin censura · Sin filtros · FF-Speed v1.0",
    modelDesc: "Ligero, rápido y totalmente sin censura — habla libre, sin filtros.",
    modelDescThinking: "Piensa y razona paso a paso antes de responder — el mismo modelo sin censura.",
    modelDescCoder: "Especializado en código — escribe, explica, refactoriza y depura en cualquier lenguaje, totalmente sin censura.",
    storageWarning:
      "Problema con los chats guardados (almacenamiento lleno o ilegible) — puede que falten algunos.",
    dismiss: "Cerrar aviso",
    typing: "El asistente está escribiendo…",
    thinking: "Razonando…",
    online: "En línea",
    offline: "Desconectado",
    suggestions: "Empieza con un modelo",
    tierFiltered: "Con filtro",
    tierUncensored: "Sin filtro",
    tierCode: "Código",
    tierFast: "Rápido",
    tierThinking: "Razonamiento",
    lockedTitle: "Crea una cuenta para chatear",
    lockedBody:
      "El chat solo está disponible con una cuenta anónima y gratis — sin correo, sin contraseña, solo un código.",
  },
  legal: {
    back: "Volver al inicio",
    updated: "Última actualización: 2026-07-07",
    termsTitle: "Términos de uso",
    termsIntro:
      "Estos Términos de uso rigen tu uso de F*ckingFilters. Al crear una cuenta o usar el servicio los aceptas. Léelos con atención.",
    terms: [
      {
        h: "Un servicio neutral",
        p: "F*ckingFilters es una plataforma neutral que ofrece modelos de IA sin censura y sin filtros —incluido un modelo especializado en código—. No creamos, respaldamos, verificamos ni controlamos lo que generan los modelos. La salida puede ser inexacta, incompleta, sesgada u ofensiva. Debes usar tu propio criterio y verificar lo importante.",
      },
      {
        h: "Tú eres responsable de cómo lo usas",
        p: "F*ckingFilters es solo una herramienta. Su dueño y responsables proporcionan el servicio, pero no controlan, supervisan ni se hacen responsables de cómo decides usarlo ni de qué haces con la salida de los modelos. Toda la responsabilidad de cómo se usa el servicio recae completamente en ti, el usuario —nunca en el dueño ni en los responsables de F*ckingFilters—. Al usar el servicio confirmas que entiendes qué es y que es tu responsabilidad saber usarlo.",
      },
      {
        h: "Servicio gratuito y límites de uso",
        p: "El servicio es gratuito por ahora. Para que sea sostenible y justo, cada cuenta tiene límites de uso (por ejemplo, una cantidad de mensajes o tokens por día, semana o mes). Estos límites existen ahora y pueden ser menores o diferentes mientras el proyecto siga siendo gratuito.",
      },
      {
        h: "Podemos cambiar todo en cualquier momento",
        p: "Como el servicio es gratuito, nos reservamos el derecho de modificar, añadir, quitar, limitar, suspender o discontinuar cualquier parte del servicio —incluidos los modelos, las funciones, los límites y la disponibilidad— en cualquier momento, con o sin aviso, y sin ninguna obligación ni responsabilidad hacia ti.",
      },
      {
        h: "Tu cuenta anónima",
        p: "Tu única credencial es un código de cuenta anónimo generado al azar. No hay correo, usuario ni contraseña. Tú eres responsable de guardar tu código; no podemos recuperarlo ni restablecerlo si lo pierdes. Las cuentas son personales e intransferibles.",
      },
      {
        h: "Las cuentas caducan tras 7 días sin uso",
        p: "Para proteger la privacidad y liberar recursos, toda cuenta que no se use durante 7 días se borra de forma permanente y automática, junto con sus contadores de uso. Usa tu cuenta periódicamente si quieres conservarla.",
      },
      {
        h: "Uso aceptable",
        p: "Te comprometes a no abusar del servicio, a no intentar saltarte los límites o los pagos, a no sobrecargar la infraestructura, a no crear cuentas automáticamente a gran escala y a no usar el servicio para algo ilegal o dañino. Podemos restringir, suspender o bloquear el acceso para proteger el servicio o a otros usuarios.",
      },
      {
        h: "Sin garantía",
        p: 'El servicio se ofrece "tal cual" y "según disponibilidad", sin ningún tipo de garantía, explícita o implícita. No garantizamos que el servicio esté disponible, sin interrupciones, que sea exacto, libre de errores o apto para un fin concreto.',
      },
      {
        h: "Limitación de responsabilidad",
        p: "En la máxima medida permitida por la ley, F*ckingFilters y sus responsables no se responsabilizan de ningún daño directo, indirecto, incidental o consecuente derivado del uso, o de la imposibilidad de uso, del servicio.",
      },
      {
        h: "Cambios en estos Términos",
        p: "Podemos actualizar estos Términos en cualquier momento. La fecha de arriba indica la versión más reciente. Seguir usando el servicio tras cualquier cambio implica que aceptas los Términos actualizados.",
      },
      {
        h: "Donaciones opcionales",
        p: "Apoyar con donaciones en Monero es totalmente opcional y puede aumentar tus límites de uso como agradecimiento. Las donaciones son voluntarias y, salvo obligación legal, no reembolsables.",
      },
    ],
    privacyTitle: "Política de privacidad",
    privacyIntro:
      "Esta Política de privacidad explica, con claridad, qué guardamos y qué no. Resumen: guardamos casi nada —solo tu código de cuenta anónimo y los contadores necesarios para aplicar tus límites de uso.",
    privacy: [
      {
        h: "Lo que guardamos",
        p: "Solo guardamos dos cosas: (1) tu código de cuenta anónimo y (2) los contadores de uso por cuenta necesarios para aplicar los límites. Nada más. A una cuenta no se asocia ningún dato personal.",
      },
      {
        h: "Sin datos personales",
        p: "Nunca pedimos, recibimos ni guardamos tu nombre, correo electrónico, teléfono, contraseña ni ningún otro identificador personal. Simplemente no hay campo para ello.",
      },
      {
        h: "Cero logs (0 logs)",
        p: "No guardamos registros de acceso, de IP, de peticiones, de errores ni analíticas vinculadas a ti. Operamos con un criterio estricto de cero logs.",
      },
      {
        h: "Sin direcciones IP",
        p: "Nunca registramos ni guardamos tu IP. La prevención de abuso se basa en un hash Argon2id unidireccional derivado de datos del dispositivo y el navegador. Un hash es matemáticamente irreversible: no se puede revertir para identificarte y no cuenta como dato personal.",
      },
      {
        h: "Tus chats no salen de tu navegador",
        p: "Tus conversaciones se guardan solo en tu navegador (localStorage). No se envían ni se almacenan en nuestros servidores. Aunque se conecte un backend, la idea es guardar solo los contadores de uso, nunca el contenido de los chats.",
      },
      {
        h: "Las cuentas se borran a los 7 días",
        p: "Si una cuenta no se usa durante 7 días, se borra de forma automática y permanente, junto con sus contadores de uso. No conservamos datos inactivos.",
      },
      {
        h: "Pagos solo en Monero",
        p: "Solo aceptamos Monero. Nunca vemos ni guardamos números de tarjeta, nombres, direcciones de facturación ni ningún identificador financiero. Esto protege tu privacidad por diseño.",
      },
      {
        h: "Cookies y almacenamiento local",
        p: "Usamos un almacenamiento local mínimo para tus preferencias (tema e idioma), tu código de cuenta y tus chats. No usamos cookies de rastreo, publicidad ni analíticas de terceros.",
      },
      {
        h: "Tus derechos",
        p: "Como no guardamos datos personales tuyos, no hay datos personales que vender, compartir o explotar. Puedes borrarlo todo al instante vaciando el almacenamiento de tu navegador o, simplemente, dejando caducar tu cuenta.",
      },
      {
        h: "Los códigos de cuenta son únicos por diseño",
        p: "Los códigos de cuenta se generan con 128 caracteres de aleatoriedad criptográfica a partir de un alfabeto de 57 símbolos —un espacio de unos 10^225 códigos posibles. La probabilidad de que dos cuentas coincidan es prácticamente nula, muy por encima de cualquier escala realista, así que un código generado no coincidirá con el de otro usuario.",
      },
      {
        h: "No dirigido a menores",
        p: "El servicio no está dirigido a niños ni diseñado para menores.",
      },
      {
        h: "Cambios en esta Política",
        p: "Podemos actualizar esta Política de privacidad en cualquier momento. La fecha de arriba indica la versión más reciente. Seguir usándola tras cualquier cambio implica que aceptas la actualización.",
      },
    ],
  },
};

export const dictionaries: Record<Locale, Dict> = { en, es };
