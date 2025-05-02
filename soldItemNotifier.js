const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Configuration
const stalls = [
  {
    url: "https://csfloat.com/api/v1/users/YourID/stall?limit=1000", //here change the steam ID to your own, you can find this in you csfloat stall or steam64ID
    fileName: "Twitter.json",
    owner: "Twitter", //change this to your own name or whatever you want
  },
  {
    url: "https://csfloat.com/api/v1/users/YourID/stall?limit=1000", // same story here if you have multiple accounts
    fileName: "Kris.json",
    owner: "Kris", //change this to your own name or whatever you want
  },
];

const notificationWebhook =
  "https://discord.com/api/webhooks/YourWebhook"; // <-- this is your discord webhook URL, you can find this in your discord server settings under integrations
const discordUserId = "YouDiscordId"; // <-- this will tag you in the discord if an item is sold you can change this to your own user ID

// Utility Functions
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch inventory data from CSFloat API
const fetchInventory = async (stall) => {
  try {
    log(`Fetching inventory from ${stall.owner} at ${stall.url}`);
    const response = await axios.get(stall.url);

    if (!response.data || !Array.isArray(response.data.data)) {
      log(`Unexpected response format for ${stall.owner}:`);
      console.dir(response.data, { depth: null });
      return [];
    }

    const items = response.data.data;
    log(`Fetched ${items.length} items from ${stall.owner}`);
    return items;
  } catch (err) {
    log(`Error fetching inventory for ${stall.owner}: ${err.message}`);
    return [];
  }
};

// Simplify item data for storage and comparison basically saves the data we need and removes the rest
const simplifyItems = (items) => {
  return items.map((item) => ({
    id: item.id,
    name: item.item?.market_hash_name || "Unknown Item",
    price: item.price,
    state: item.state,
    cs2_screenshot_id: item.item?.cs2_screenshot_id || null,
    icon_url: item.item?.icon_url || null,
  }));
};

// Load previous items from JSON file
const loadPreviousItems = (fileName) => {
  try {
    const filePath = path.join(__dirname, fileName);
    const raw = fs.readFileSync(filePath);
    const data = JSON.parse(raw);
    log(`Loaded ${data.length} previous items from ${fileName}`);
    return data;
  } catch (err) {
    log(`No previous items found for ${fileName}, starting fresh`);
    return [];
  }
};

// Save current items to JSON file
const saveCurrentItems = (items, fileName) => {
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
  log(`Saved ${items.length} current items to ${fileName}`);
};

// Sends notification to Discord webhook if you have sold an item, and if u know how to do this haha
const notifySoldItem = async (item, owner) => {
  const content = `<@${discordUserId}>`; // ✅ tag you

  const embed = {
    title: `Item was sold on ${owner}`,
    description: `**${item.name}**`,
    color: 0xff0000,
    fields: [
      {
        name: "Price",
        value: `$${(item.price / 100).toFixed(2)}`,
        inline: true,
      },
      {
        name: "State",
        value: item.state || "unknown",
        inline: true,
      },
    ],
    footer: { text: `Item ID: ${item.id}` },
  };

  if (item.cs2_screenshot_id) {
    embed.image = {
      url: `https://s.csfloat.com/m/${item.cs2_screenshot_id}/playside.png?v=3`, //Image for Discord
    };
  } else if (item.icon_url) {
    embed.image = {
      url: `https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`, //Backup image for Discord
    };
  }

  try {
    await axios.post(notificationWebhook, {
      content,
      embeds: [embed],
    });
    log(`✅ Sent Discord notification for item ID: ${item.id}`);
  } catch (error) {
    log(`❌ Failed to send Discord notification: ${error.message}`);
  }
};

// This will check if your items are sold and notify you, then save the current items
const checkForSoldItems = async () => {
  for (const stall of stalls) {
    const currentRawItems = await fetchInventory(stall);
    const currentItems = simplifyItems(currentRawItems);
    const prevItems = loadPreviousItems(stall.fileName);
    const currentIds = currentItems.map((item) => item.id);

    const soldItems = prevItems.filter(
      (item) => !currentIds.includes(item.id)
    );
    if (soldItems.length > 0) {
      log(`🔔 ${soldItems.length} item(s) sold from ${stall.owner}`);
    } else {
      log(`No items sold from ${stall.owner}`);
    }

    for (const soldItem of soldItems) {
      await notifySoldItem(soldItem, stall.owner);
    }

    saveCurrentItems(currentItems, stall.fileName);
    await delay(2000);
  }
};

// Main function to run the code every 15 minutes, you can change this to whatever you want like 5 min or 10 hours whatever u want
const runMonitor = async () => {
  while (true) {
    log("🔄 Starting inventory check...");
    await checkForSoldItems();
    log("✅ Check complete. Waiting 15 minutes...");
    await delay(15 * 60 * 1000); // 15 minutes, change the 15 digit only or ask chatgpt how to change it to hours :D
  }
};

runMonitor();
