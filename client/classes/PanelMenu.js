import GUI from "./GUI";
import {ResourceMesh} from "./ResourceMesh";

export default class PanelMenu extends GUI {
    constructor(options, subMenus = [], x = 0, y = 0, pickResult, player, at, transparentBackground = false) {
        super();
        this.options = options;
        this.pickResult = pickResult;
        this.player = player;
        this.subMenus = subMenus;
        this.advancedTexture = at;
        let greatestLength = 0;
        PanelMenu.REF_CTX.font = `${PanelMenu.BUTTON_FONT_SIZE}px ${PanelMenu.BUTTON_FONT}`;
        for (let i = 0; i < options.length; i++) {
            let length = PanelMenu.REF_CTX.measureText('  ' + options[i]).width + (subMenus[i] ? 15 : 0);
            if (length > greatestLength) {
                greatestLength = length;
            }
        }
        this.panel = new BABYLON.GUI.StackPanel();
        this.panel.width = `${Math.round(greatestLength + 15)}px`;
        if (!transparentBackground) {
            this.panel.background = '#818181';
        }
        this.panel.left = `${x}px`;
        this.panel.top = `${y}px`;
        this.panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        this._control = this.panel;
        let heightString1 = `${PanelMenu.BUTTON_BASE_HEIGHT}px`;
        let heightString2 = `${PanelMenu.BUTTON_BASE_HEIGHT - PanelMenu.BUTTON_PADDING}px`;
        let paddingString = `${PanelMenu.BUTTON_PADDING}px`;
        let activeSubMenu = null;
        /*
            Add a button to the panel for each option
        */
        let i = 0;
        for (let option of options) {
            let button = GUI.CreateButton('', '  ' + option, !!subMenus[i]);
            button.width = 1;
            if (option === options[0]) {
                button.height = heightString1;
                button.paddingTop = paddingString;
            } else {
                button.height = heightString2;
            }
            button.paddingBottom = paddingString;
            button.paddingLeft = paddingString;
            button.paddingRight = paddingString;
            button.fontFamily = PanelMenu.BUTTON_FONT;
            button.fontSize = PanelMenu.BUTTON_FONT_SIZE;
            button.thickness = 0;
            button.color = '#000000';
            button.background = '#E5E5E5';
            this.panel.addControl(button);
            button.pointerEnterAnimation = () => {
                button.color = '#000000';
                button.background = '#B9B9B9';
            };
            button.pointerOutAnimation = () => {
                button.color = '#000000';
                button.background = '#E5E5E5';
            };
            button.pointerDownAnimation = () => {
            };
            button.pointerUpAnimation = () => {
            };
            let _i = i;
            button.onPointerEnterObservable.add(() => {
                if (activeSubMenu && activeSubMenu !== subMenus[_i]) {
                    activeSubMenu.remove();
                }
            });
            if (subMenus[i]) {
                button.onPointerEnterObservable.add(() => {
                    subMenus[_i].addTo(this.container);
                    activeSubMenu = subMenus[_i];
                    activeSubMenu.panel.top = `${this.panel.topInPixels + button.topInPixels - (_i > 0 ? PanelMenu.BUTTON_PADDING : 0)}px`;
                    activeSubMenu.panel.left = `${this.panel.leftInPixels + this.panel.widthInPixels - PanelMenu.BUTTON_PADDING}px`;
                });
            }
            button.onPointerDownObservable.add(() => {
                console.log(option);

                // Do something!
                switch (option) {
                    case "Inspect":
                        alert("Something!");
                        break;
                    case "Attack":
                        this.player.attack();

                        // if (BABYLON.Vector3.Distance(this.pickResult.pickedPoint, this.player.player.position) < 10) {
                        //     // Attack
                        //     this.player.attack();
                        // }
                        break;
                    case "Walk Here":
                        this.player.addDestination(this.pickResult.pickedPoint.clone());
                        break;
                    case "Destroy":
                        // TODO: Authorize with server
                        this.player.addDestroy(this.pickResult);

                        break;
                }

                this.remove();
            });
            i++;
        }
    }

    remove() {
        for (let subMenu of this.subMenus) {
            if (subMenu) {
                subMenu.remove();
            }
        }
        super.remove();
    }
}

PanelMenu.BUTTON_BASE_HEIGHT = 25;
PanelMenu.BUTTON_PADDING = 2;
PanelMenu.BUTTON_FONT_SIZE = 14;
PanelMenu.BUTTON_FONT = 'Arial';
PanelMenu.REF_CTX = document.createElement('canvas').getContext('2d');
