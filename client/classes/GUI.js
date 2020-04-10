export default class GUI {
    constructor() {
        this.container = null;
    }
    addTo(container) {
        this.container = container;
        this.container.addControl(this._control);
    }
    remove() {
        if (this.container) {
            this.container.removeControl(this._control);
        }
    }
    get control() {
        return this._control;
    }
    /**
     * Create a BABYLON.GUI button with left-aligned text, and an optional right arrow for sub menus.
     * @param name A name for the button
     * @param text The button text
     * @param rightArrow Whether to add a right arrow
     */
    static CreateButton(name, text, rightArrow = false) {
        let result = new BABYLON.GUI.Button(name);
        {
            // Adding text
            let textBlock = new BABYLON.GUI.TextBlock(name + "_button", text);
            textBlock.textWrapping = true;
            textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            result.addControl(textBlock);
        }
        if (rightArrow) {
            // Adding text
            let textBlock = new BABYLON.GUI.TextBlock(name + "_button", '> ');
            textBlock.textWrapping = true;
            textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            result.addControl(textBlock);
        }
        return result;
    }
}
