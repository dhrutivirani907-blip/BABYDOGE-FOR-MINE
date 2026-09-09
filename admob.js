import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  RewardAdPluginEvents
} from "@capacitor-community/admob";

const REWARDED_ID = "ca-app-pub-4315317994778211/7279532248";

window.initAdMob = async function () {

    if (!Capacitor.isNativePlatform()) {
        console.log("Browser - AdMob Disabled");
        return;
    }

    try {

        await AdMob.initialize();

        await AdMob.prepareRewardVideoAd({
            adId: REWARDED_ID
        });

        console.log("Reward Ad Ready");

    } catch (e) {

        console.log("Init Error", e);

    }

};

window.showRewardAd = async function () {

    try {

        await AdMob.showRewardVideoAd();

        return true;

    } catch (e) {

        console.log("Show Error", e);

        return false;

    }

};

AdMob.addListener(
    RewardAdPluginEvents.Dismissed,
    async () => {

        try {

            await AdMob.prepareRewardVideoAd({
                adId: REWARDED_ID
            });

            console.log("Next Reward Prepared");

        } catch (e) {

            console.log(e);

        }

    }
);