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
      <button className="button" onClick={mintNewWidget}>
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
      <button className="button" onClick={listItem}>
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
      <button className="button" onClick={purchaseListing}>
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
      <button className="button" onClick={takeProfits}>
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
    toast.success(`Successfully refreshed listings!`, {
      position: toast.POSITION.TOP_LEFT,
      autoClose: 3000,
    });
    console.log(output);
  };

  return (
    <WalletKitProvider>
      <ToastContainer />
      {!idsEntered ? (
        <div className="centered">
          <input type="text" value={packageId} onChange={handlePackageIdInput} placeholder="Enter PackageId" />
          <input type="text" value={marketplaceId} onChange={handleMarketplaceIdInput} placeholder="Enter MarketplaceId" />
          <button className="button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      ) : (
        <div>
          <div class="header">
            <div class="column header-left title">MarketplaceId: {marketplaceId}</div>
            <div class="header-right">
              <ConnectButton />
            </div>
          </div>
          <div class="row" id="second-row">
            <div class="column">
              <img src="marketplace-banner.png" alt="Banner" className="banner-image"></img>
            </div>
            <div class="column">
              <div class="sub-row">
                <MintNewWidget setAccountAddress={setAccountAddress} packageId={packageId} />
              </div>
              <div class="sub-row">
                <button className="button" onClick={getOwnedWidgets}>
                  get owned widgets
                </button>
              </div>

              <div class="sub-row">
                <div class="input-container">
                  <div class="column1">
                    <ListItem widgetToList={widgetToList} price={price} packageId={packageId} marketplaceId={marketplaceId} />
                  </div>
                  <div class="column column2">
                    <div class="row row1">
                      <input type="text" value={widgetToList} onChange={handleWidgetInput} placeholder="input widgetId" />
                    </div>
                    <div class="row row2">
                      <input type="number" value={price} onChange={handlePriceInput} placeholder="input price" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="sub-row">
                <button className="button" onClick={getListingInformation}>
                  get listings
                </button>
              </div>

              <div class="sub-row">
                <div class="input-container">
                  <div class="column column1">
                    <PurchaseListing itemToPurchase={itemToPurchase} amountSent={amountSent} packageId={packageId} marketplaceId={marketplaceId} />
                  </div>
                  <div class="column column2">
                    <div class="row row1">
                      <input type="text" value={itemToPurchase} onChange={handleItemToPurchaseInput} placeholder="input itemId" />
                    </div>
                    <div class="row row2">
                      <input type="number" value={amountSent} onChange={handleAmountSentInput} placeholder="input amount" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="sub-row">
                <TakeProfits packageId={packageId} marketplaceId={marketplaceId} />
              </div>
            </div>
          </div>
          <div class="row" id="third-row">
            <div class="column">
              <div class="title">Listings:</div>
              <div className="listing-info text">
                <ul>
                  {listingInfo &&
                    listingInfo.map((listing, idx) => {
                      return (
                        <li>
                          Item {idx}
                          <ul>
                            {listing.map((info, infoIdx) => {
                              return <li>{info}</li>;
                            })}
                          </ul>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>

            <div class="column">
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
        </div>
      )}
    </WalletKitProvider>
  );
}

export default App;
