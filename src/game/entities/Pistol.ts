import { PISTOL_CARD } from "../constants";

export class Pistol {
  private ammo = PISTOL_CARD.magSize;
  private isReloading = false;
  private nextFireTimeMs = 0;
  private reloadCompleteTimeMs = 0;

  public update(nowMs: number): void {
    if (this.isReloading && nowMs >= this.reloadCompleteTimeMs) {
      this.isReloading = false;
      this.ammo = PISTOL_CARD.magSize;
    }
  }

  public tryFire(nowMs: number): boolean {
    this.update(nowMs);

    if (this.isReloading || this.ammo <= 0 || nowMs < this.nextFireTimeMs) {
      return false;
    }

    this.ammo -= 1;
    this.nextFireTimeMs = nowMs + 1000 / PISTOL_CARD.fireRatePerSecond;

    if (this.ammo === 0) {
      this.startReload(nowMs);
    }

    return true;
  }

  public tryReload(nowMs: number): boolean {
    this.update(nowMs);

    if (this.isReloading || this.ammo === PISTOL_CARD.magSize) {
      return false;
    }

    this.startReload(nowMs);
    return true;
  }

  public getAmmo(): number {
    return this.ammo;
  }

  public getIsReloading(): boolean {
    return this.isReloading;
  }

  public getReloadTimeRemainingMs(nowMs: number): number {
    if (!this.isReloading) {
      return 0;
    }

    return Math.max(0, this.reloadCompleteTimeMs - nowMs);
  }

  private startReload(nowMs: number): void {
    this.isReloading = true;
    this.reloadCompleteTimeMs = nowMs + PISTOL_CARD.reloadTimeMs;
  }
}
