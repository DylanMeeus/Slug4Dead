import Phaser from "phaser";

import {
  CAMPAIGNS,
  GAMEPLAY_STATES,
  GAME_TITLE,
  SCENE_KEYS,
  SURVIVORS,
  type CampaignDefinition,
  type SurvivorName
} from "../constants";

export class MenuScene extends Phaser.Scene {
  public static readonly key = SCENE_KEYS.menu;

  public constructor() {
    super(MenuScene.key);
  }

  public create(): void {
    this.renderCampaignSelection();
  }

  private renderCampaignSelection(): void {
    const { width, height } = this.scale;

    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#121722");

    this.add
      .text(width / 2, height / 2 - 90, GAME_TITLE, {
        fontFamily: "monospace",
        fontSize: "44px",
        color: "#f6f1d1"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 28, "Pre-Level", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#9fe870"
      })
      .setOrigin(0.5);

    CAMPAIGNS.forEach((campaign, index) => {
      const campaignText = this.add
        .text(width / 2, height / 2 + 40 + index * 58, `Play ${campaign.label}`, {
          fontFamily: "monospace",
          fontSize: "28px",
          color: "#ffffff",
          backgroundColor: "#253047",
          padding: { x: 14, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      campaignText.on("pointerdown", () => {
        this.renderSurvivorSelection(campaign);
      });
    });

    this.add
      .text(width / 2, height / 2 + 104, `State: ${GAMEPLAY_STATES.preLevel}`, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#9ba8c7"
      })
      .setOrigin(0.5);
  }

  private renderSurvivorSelection(campaign: CampaignDefinition): void {
    const { width, height } = this.scale;

    this.children.removeAll();
    this.cameras.main.setBackgroundColor("#121722");

    this.add
      .text(width / 2, height / 2 - 128, GAME_TITLE, {
        fontFamily: "monospace",
        fontSize: "44px",
        color: "#f6f1d1"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 68, `Choose survivor for ${campaign.label}`, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#9fe870"
      })
      .setOrigin(0.5);

    SURVIVORS.forEach((survivor, index) => {
      const xOffset = index % 2 === 0 ? -118 : 118;
      const yOffset = Math.floor(index / 2) * 66;
      const survivorText = this.add
        .text(width / 2 + xOffset, height / 2 + yOffset, survivor, {
          fontFamily: "monospace",
          fontSize: "26px",
          color: "#ffffff",
          backgroundColor: "#253047",
          padding: { x: 16, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      survivorText.on("pointerdown", () => {
        this.startCampaign(campaign, survivor);
      });
    });

    const backText = this.add
      .text(width / 2, height / 2 + 156, "Back", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#10131a",
        backgroundColor: "#f6f1d1",
        padding: { x: 14, y: 8 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backText.on("pointerdown", () => {
      this.renderCampaignSelection();
    });
  }

  private startCampaign(
    campaign: CampaignDefinition,
    survivorName: SurvivorName
  ): void {
    this.scene.start(SCENE_KEYS.alphaLevel, {
      campaignKey: campaign.key,
      levelIndex: 0,
      survivorName
    });
  }
}
