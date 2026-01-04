
## Project info


## How can I edit this code?

There are several ways of editing your application.




**Use your preferred IDE**


The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment variables

Create a `.env` file in the project root. See `.env.example` for required values.

### PayPal (client-side)

- `VITE_PAYPAL_CLIENT_ID`: Your PayPal REST client ID
- `VITE_PAYPAL_ENV`: `sandbox` or `live`

### Supabase Edge Functions (server-side)

Configure these secrets in your Supabase functions environment:

- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV` (`sandbox` or `live`)
- `APP_ORIGIN` (e.g. `http://localhost:5173` or your LAN host)

Pricing uses PayPal Buttons with Supabase:

- `create-payment` creates the PayPal order and returns `orderId`/`approvalUrl`
- `capture-payment` captures the approved order

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?



Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

