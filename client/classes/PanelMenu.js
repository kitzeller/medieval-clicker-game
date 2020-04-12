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
                        // TODO: Refactor this out to another class
                        // TODO: Authorize with server
                        console.log(BABYLON.Vector3.Distance(this.pickResult.pickedPoint, this.player.player.position))
                        if (BABYLON.Vector3.Distance(this.pickResult.pickedPoint, this.player.player.position) < 20) {

                            // TODO: Fix weird look glitch
                            this.player.lookAtPoint(this.pickResult.pickedPoint);

                            let slider = new BABYLON.GUI.Slider();
                            this.advancedTexture.addControl(slider);
                            slider.minimum = 0;
                            slider.maximum = 100;
                            slider.value = 0;
                            slider.height = "20px";
                            slider.width = "100px";
                            slider.background = "red";
                            slider.color = "green";
                            slider.linkWithMesh(this.pickResult.pickedMesh);

                            this.pickResult.pickedMesh.destroyParticles = ResourceMesh.createDestroyParticles(this.pickResult.pickedMesh);
                            ResourceMesh.addOutline(this.pickResult.pickedMesh);

                            this.player.meshToDestroy = this.pickResult.pickedMesh;
                            this.player.meshToDestroySlider = slider;
                        } else {

                            // TODO: Subtract minimum distance
                            this.player.addDestination(this.pickResult.pickedPoint.clone());
                        }

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
