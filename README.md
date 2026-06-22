# App Finanzas · Disegnarus

Aplicación web progresiva (PWA) para gestión financiera personal y de estudio creativo.

## Stack

- **React 19 + Vite 8** — SPA con lazy loading por ruta
- **Supabase** — autenticación (email/password + 2FA TOTP) y almacenamiento de datos en la nube
- **Framer Motion** — animaciones y gestos táctiles
- **Recharts** — gráficas de evolución
- **React Router 7** — navegación
- **vite-plugin-pwa** — instalable como app nativa

## Modos

| Modo | Descripción |
|------|-------------|
| **Personal** | Presupuesto mensual por categorías, transacciones, ingresos, suscripciones, deudas, metas de ahorro, patrimonio, tarjetas |
| **Estudio** | Ingresos y gastos del estudio, reparto de ingresos entre socios, evolución anual |

## Desarrollo local

```bash
npm install
npm run dev
```

Requiere un archivo `.env` con las variables de Supabase:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Estructura

```
src/
├── components/
│   ├── dashboard/     # HeroCard, CategoryGrid, gráficos
│   ├── layout/        # Sidebar, TabBar, PageLayout
│   ├── personal/      # TransactionList, AddTransactionSheet
│   └── ui/            # Sheet, Toast, ErrorBoundary, LoadingScreen...
├── context/
│   ├── AuthContext    # Auth + modo (personal/estudio), sync a Supabase
│   ├── FinanceContext # Estado financiero, sync localStorage ↔ Supabase
│   └── actions.js     # Reducer y action types
├── pages/             # Dashboard, Personal, Estudio, Metas, Deudas...
└── utils/
    ├── calculations   # Funciones de cálculo (sin efectos)
    ├── formatCurrency # Formato COP
    └── seedData       # Estado inicial para nuevos usuarios
```

## Despliegue

Desplegado en **Vercel**. El archivo `vercel.json` redirige todas las rutas a `index.html` para que funcione la navegación SPA.
