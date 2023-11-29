// react libraries
import React, { useState, useEffect } from "react";
import "./App.css";

// toastify libraries
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// sui libraries
import { WalletKitProvider, ConnectButton, useWalletKit } from "@mysten/wallet-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

// const PACKAGE_ID = "0xd0d5a4f436c95da6969b3984ba60a5b054aa2a22d2b624a2ff5016b905aa4bb2";
// const MARKETPLACE_ID = "0xc5da236211d47b306e2c9696877b8808ee990cbd215a03f2977e34e0557f05f4";

function MintNewWidget({ setAccountAddress, packageId }) {
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();

  useEffect(() => {
    if (currentAccount?.address) {
      setAccountAddress(currentAccount.address);
    }
  }, [currentAccount, setAccountAddress]);

  const mintNewWidget = async () => {
    try {
      // prepare transaction block
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${packageId}::widget::mint`,
      });

      // sign and execute transaction block with wallet
      const output = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      console.log("output from minting widget:", output);

      toast.success("Successfully minted widget!", {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
    } catch (e) {
      alert("Failed to create widget item");
      console.log(e);
    }
  };

  return (
    <div>
      <button className="button-8" onClick={mintNewWidget}>
        mint new widget
      </button>
    </div>
  );
}

function ListItem({ widgetToList, price, packageId, marketplaceId }) {
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const listItem = async () => {
    try {
      // prepare transaction block
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${packageId}::marketplace::list`,
        typeArguments: [`${packageId}::widget::Widget`, "0x2::sui::SUI"],
        arguments: [txb.object(marketplaceId), txb.object(widgetToList), txb.pure(price)],
      });

      // sign and execute transaction block with wallet
      const output = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      // iterate through to get ID of listing
      const createdObjects = output.effects.created;
      console.log("createdObjects:", createdObjects);

      toast.success(`Listing created!`, {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
    } catch (e) {
      alert("Failed to list item");
      console.log(e);
    }
  };

  return (
    <div>
      <button className="button-8" onClick={listItem}>
        list item
      </button>
    </div>
  );
}

function PurchaseListing({ itemToPurchase, amountSent, packageId, marketplaceId }) {
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const purchaseListing = async () => {
    try {
      // prepare transaction block, split coin
      const txb = new TransactionBlock();
      const [coin] = txb.splitCoins(txb.gas, [txb.pure(amountSent)]);

      // prepare transaction block
      txb.moveCall({
        target: `${packageId}::marketplace::buy_and_take`,
        typeArguments: [`${packageId}::widget::Widget`, "0x2::sui::SUI"],
        arguments: [txb.object(marketplaceId), txb.pure(itemToPurchase), coin],
      });

      // sign and execute transaction block with wallet
      const output = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      console.log("output:", output);

      toast.success(`Successfully purchased!`, {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
    } catch (e) {
      console.log(e);
      alert("Failed to purchase listing");
    }
  };
  return (
    <div>
      <button className="button-8" onClick={purchaseListing}>
        purchase item
      </button>
    </div>
  );
}

function TakeProfits({ packageId, marketplaceId }) {
  const { signAndExecuteTransactionBlock } = useWalletKit();

  const takeProfits = async () => {
    try {
      // prepare transaction block
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${packageId}::marketplace::take_profits_and_keep`,
        typeArguments: ["0x2::sui::SUI"],
        arguments: [txb.object(marketplaceId)],
      });

      // sign and execute transaction block with wallet
      const output = await signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      console.log("output:", output);

      toast.success(`Successfully took profits!`, {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
    } catch (e) {
      console.log(e);
      alert("Failed to take profits");
    }
  };
  return (
    <div>
      <button className="button-8" onClick={takeProfits}>
        take profits
      </button>
    </div>
  );
}

function App() {
  const [marketplaceId, setMarketplaceId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [idsEntered, setIdsEntered] = useState(false);
  const [accountAddress, setAccountAddress] = useState("");
  const [ownedWidgets, setOwnedWidgets] = useState("");
  const [widgetToList, setWidgetToList] = useState("");
  const [price, setPrice] = useState("");
  const [itemToPurchase, setItemToPurchase] = useState("");
  const [listingInfo, setListingInfo] = useState("");
  const [amountSent, setAmountSent] = useState("");

  const handleMarketplaceIdInput = (event) => {
    setMarketplaceId(event.target.value);
  };

  const handlePackageIdInput = (event) => {
    setPackageId(event.target.value);
  };

  const handleSubmit = () => {
    if (marketplaceId.trim() !== "" && packageId.trim() !== "") {
      setIdsEntered(true);
    } else {
      alert("Please enter your PackageID and MarketplaceID");
    }
  };

  const handleWidgetInput = (event) => {
    setWidgetToList(event.target.value);
  };

  const handlePriceInput = (event) => {
    setPrice(event.target.value);
  };

  const handleItemToPurchaseInput = (event) => {
    setItemToPurchase(event.target.value);
  };

  const handleAmountSentInput = (event) => {
    setAmountSent(event.target.value);
  };

  const getOwnedWidgets = async () => {
    try {
      const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
      const objects = await suiClient.getOwnedObjects({ owner: accountAddress });
      const widgets = [];

      // iterate through all objects owned by address
      for (let i = 0; i < objects.data.length; i++) {
        const currentObjectId = objects.data[i].data.objectId;

        // get object information
        const objectInfo = await suiClient.getObject({
          id: currentObjectId,
          options: { showContent: true },
        });

        if (objectInfo.data.content.type == `${packageId}::widget::Widget`) {
          const widgetObjectId = objectInfo.data.content.fields.id.id;
          console.log("widget spotted:", widgetObjectId);
          widgets.push(widgetObjectId);
        }
      }
      setOwnedWidgets(widgets);
      toast.success(`Successfully refreshed owned widgets!`, {
        position: toast.POSITION.TOP_LEFT,
        autoClose: 3000,
      });
    } catch (e) {
      alert("Failed to refresh");
      console.log(e);
    }
  };

  const getListingInformation = async () => {
    const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

    // get marketplace ID
    const marketplaceObject = await suiClient.getObject({
      id: marketplaceId,
      options: { showContent: true },
    });
    const marketplaceItemsId = marketplaceObject.data.content.fields.items.fields.id.id;

    // get marketplace items ID
    const marketplaceItems = await suiClient.getDynamicFields({ parentId: marketplaceItemsId });

    const listingIds = [];
    // get listing IDs - loop through and save IDs using useState
    for (let i = 0; i < marketplaceItems.data.length; i++) {
      listingIds.push(marketplaceItems.data[i].objectId);
    }

    const output = [];
    // iterate through all listings and populate output array
    for (let i = 0; i < listingIds.length; i++) {
      const currentListing = [];
      const listingObject = await suiClient.getObject({
        id: listingIds[i],
        options: { showContent: true },
      });

      // save relevant info into an array for displaying on frontend
      currentListing.push(`listingId: ${listingIds[i]}`);
      currentListing.push(`askPrice: ${listingObject.data.content.fields.value.fields.ask}`);
      currentListing.push(`owner: ${listingObject.data.content.fields.value.fields.owner}`);
      currentListing.push(`widget: ${listingObject.data.content.fields.name}`);
      output.push(currentListing);
    }

    setListingInfo(output);
    console.log(output);
  };

  return (
    <WalletKitProvider>
      <ToastContainer />
      {!idsEntered ? (
        <div className="centered">
          <input type="text" value={packageId} onChange={handlePackageIdInput} placeholder="Enter PackageId" />
          <input type="text" value={marketplaceId} onChange={handleMarketplaceIdInput} placeholder="Enter MarketplaceId" />
          <button className="button-8" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      ) : (
        <div>
          <div className="header">
            <div className="header-left title">MarketplaceId: {marketplaceId}</div>
            <div className="header-right">
              <ConnectButton />
            </div>
          </div>
          <div className="banner-container">
            <img src="marketplace-banner.png" alt="Banner" className="banner-image" />
          </div>
          <div className="quadrants">
            <div class="container">
              <div class="top-half">
                <div class="column title">Marketplace Listings</div>
                <div class="container1">
                  <div class="left-column1">
                    <div class="top-row1">
                      <input type="text" value={widgetToList} onChange={handleWidgetInput} placeholder="input widgetId" />
                    </div>
                    <div class="bottom-row1">
                      <input type="number" value={price} onChange={handlePriceInput} placeholder="input price" />
                    </div>
                  </div>
                  <div class="right-column1">
                    <ListItem widgetToList={widgetToList} price={price} packageId={packageId} marketplaceId={marketplaceId} />
                  </div>
                </div>

                <div class="column"></div>
              </div>
              <div class="bottom-half">
                <button className="button-8" onClick={getListingInformation}>
                  get listings
                </button>
                <div className="listing-info">
                  <ol>
                    {listingInfo &&
                      listingInfo.map((listing, idx) => {
                        return (
                          <li>
                            Item {idx}
                            <ul>
                              {listing.map((info, infoIdx) => {
                                return <li>${info}</li>;
                              })}
                            </ul>
                          </li>
                        );
                      })}
                  </ol>
                </div>
              </div>
            </div>

            <div class="container">
              <div class="top-half">
                <div class="column title">Widgets</div>
                <div class="column">
                  <MintNewWidget setAccountAddress={setAccountAddress} packageId={packageId} />
                </div>
                <div class="column">
                  <button className="button-8" onClick={getOwnedWidgets}>
                    get owned widgets
                  </button>
                </div>
              </div>
              <div class="bottom-half">
                <div className="title">Currently owned widgets:</div>
                <div className="text">
                  <ul>
                    {ownedWidgets &&
                      ownedWidgets.map((widget, idx) => {
                        return <li>{widget}</li>;
                      })}
                  </ul>
                </div>
              </div>
            </div>
            <div className="quadrant title">
              Purchase Listing
              <input type="text" value={itemToPurchase} onChange={handleItemToPurchaseInput} placeholder="input itemId" />
              <div>
                <input type="number" value={amountSent} onChange={handleAmountSentInput} placeholder="input transfer amount" />
              </div>
              <div>
                <PurchaseListing itemToPurchase={itemToPurchase} amountSent={amountSent} packageId={packageId} marketplaceId={marketplaceId} />
              </div>
            </div>
            <div className="quadrant title">
              Profits
              <TakeProfits packageId={packageId} marketplaceId={marketplaceId} />
            </div>
          </div>
        </div>
      )}
    </WalletKitProvider>
  );
}

export default App;
