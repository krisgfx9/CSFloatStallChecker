# CSFloat Item Sale Discord Notifier

This is a Node.js script that checks your CSFloat stal and notifies you via **Discord** when an item is sold.

And yes its made for multiple accounts.
---

## Features

- Detects sold items from one or more CSFloat accounts
- Sends notifications to Discord via webhook
- Includes item name, price, condition, and image
- Tags you on Discord if something is sold
- Automatically runs every 15 minutes (This can be changed)

---

## Setup Instructions

### 1. Clone or Download the Repo

Make sure you're inside the folder where `soldItemNotifier.js` is saved.

### 2. Install Dependencies

Only one external dependency is required:

```bash
npm install axios
```
### 3. Requirements

- Node.js (so you can run the code)
- A Discord webhook URL (google how to get this)
- Your Steam64 ID (found in your CSFloat stall URL)
- Your Discord user ID (if you want to get pinged if not dont do this)

---

### Configuration

Edit the `stalls` array to monitor your CSFloat stall(s) if u have multiple:

```js
const stalls = [
  {
    url: "https://csfloat.com/api/v1/users/7656119xxx8983xxxxx/stall?limit=1000", // add your steamID where it says "7656119xxx8983xxxxx" you can find this in your CSFloat Stall or steam64Id website
    fileName: "Kris.json", // You can put your name here
    owner: "Kris", // Same here
  },
];
```
### Then update:

```js
const notificationWebhook = "https://discord.com/api/webhooks/...";
const discordUserId = "YOUR_DISCORD_ID";
```
To get your Discord ID:
Enable Developer Mode → Right-click your name → Copy ID

### To run the Code
```js
node soldItemNotifier.js // You can change the name of it
```

#### Customization
```js
await delay(15 * 60 * 1000); // 15 minutes, change the 15 digit only or ask chatgpt how to change it to hours :D
```
If you have your own VPS(Virtual Server) you can install PM2 to make sure the code is running 24/7

# That's it, hope it helps
