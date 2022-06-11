import BlockType from '../../extension-support/block-type';
import ArgumentType from '../../extension-support/argument-type';
import Cast from '../../util/cast';
import translations from './translations.json';
import blockIcon from './block-icon.png';

/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = messageData => messageData.defaultMessage;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const EXTENSION_ID = 'handsfree2scratch';

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = 'https://champierre.github.io/handsfree2scratch/dist/handsfree2scratch.mjs';

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return formatMessage({
            id: 'handsfree2scratch.name',
            default: 'Handsfree2Scratch',
            description: 'name of the extension'
        });
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL () {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL (url) {
        extensionURL = url;
    }

    /**
     * Construct a set of blocks for Handsfree2Scratch.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }

        const scriptElem = document.createElement('script');
        scriptElem.src = 'https://unpkg.com/handsfree@8.5.1/build/lib/handsfree.js';
        document.head.appendChild(scriptElem);

        setTimeout(() => {
            const handsfree = new Handsfree({showDebug: true, hands: true});
            handsfree.start();
        
            // Create a plugin named "logger" to show data on every frame
            handsfree.use('logger', data => {
                console.log(data.hands);
            })
        }, 1000);



        
    }

    doIt (args) {
        const func = new Function(`return (${Cast.toString(args.SCRIPT)})`);
        const result = func.call(this);
        console.log(result);
        return result;
    }

    getX (args) {
        console.log(args.LANDMARK);
    }


    get LANDMARK_MENU () {
        let landmark_menu = [];
        for (let i = 1; i <= 1; i++) {
            landmark_menu.push({text: `${formatMessage({id: 'handsfree2scratch.leftHand' + i})} (${i})`, value: String(i)})
        }
        return landmark_menu;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        setupTranslations();
        return {
            id: ExtensionBlocks.EXTENSION_ID,
            name: ExtensionBlocks.EXTENSION_NAME,
            extensionURL: ExtensionBlocks.extensionURL,
            blockIconURI: blockIcon,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'do-it',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.doIt',
                        default: 'do it [SCRIPT]',
                        description: 'execute javascript for example'
                    }),
                    func: 'doIt',
                    arguments: {
                        SCRIPT: {
                            type: ArgumentType.STRING,
                            defaultValue: '3 + 5'
                        }
                    }
                },
                {
                    opcode: 'getX',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.getX',
                        default: 'x of [LANDMARK]',
                        description: 'x of the selected landmark'
                    }),
                    func: 'getX',
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: '0'
                        }
                    }
                },

            ],
            menus: {
                landmark: {
                    acceptReporters: true,
                    items: this.LANDMARK_MENU
                }
            }
        };
    }
}

export {
    ExtensionBlocks as default,
    ExtensionBlocks as blockClass
};
