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

        this.hands = []

        setTimeout(() => {
            const handsfree = new Handsfree({showDebug: false, hands: true});
            handsfree.start();
        
            // Create a plugin named "logger" to show data on every frame
            handsfree.use('logger', data => {
                this.hands = data.hands;
                console.log(this.hands.landmarks[0]);
            })
        }, 1000);
    }

    getLeftHandX (args) {
        let landmark = args.LANDMARK - 1;
        if (this.hands && this.hands.landmarks[0] && this.hands.landmarks[0][landmark]) {
            if (this.runtime.ioDevices.video.mirror === false) {
                return -1 * (240 - this.hands.landmarks[0][landmark].x * 480);
            } else {
                return 240 - this.hands.landmarks[0][landmark].x * 480;
            }
        } else {
            return "";
        }
    }

    getLeftHandY (args) {
        let landmark = args.LANDMARK - 1;
        if (this.hands && this.hands.landmarks[0] && this.hands.landmarks[0][landmark]) {
            return 180 - this.hands.landmarks[0][landmark].y * 360;
        } else {
            return "";
        }
    }

    getRightHandX (args) {
        let landmark = args.LANDMARK - 1;
        if (this.hands && this.hands.landmarks[1] && this.hands.landmarks[1][landmark]) {
            if (this.runtime.ioDevices.video.mirror === false) {
                return -1 * (240 - this.hands.landmarks[1][landmark].x * 480);
            } else {
                return 240 - this.hands.landmarks[1][landmark].x * 480;
            }
        } else {
            return "";
        }
    }

    getRightHandY (args) {
        let landmark = args.LANDMARK - 1;
        if (this.hands && this.hands.landmarks[1] && this.hands.landmarks[1][landmark]) {
            return 180 - this.hands.landmarks[1][landmark].y * 360;
        } else {
            return "";
        }
    }

    videoToggle (args) {
        let state = args.VIDEO_STATE;
        if (state === 'off') {
            this.runtime.ioDevices.video.disableVideo();
        } else {
            this.runtime.ioDevices.video.enableVideo();
            this.runtime.ioDevices.video.mirror = state === "on";
        }
    }

    get LANDMARK_MENU () {
        let landmark_menu = [];
        for (let i = 1; i <= 1; i++) {
            landmark_menu.push({text: `${formatMessage({id: 'handsfree2scratch.handLandmark' + i})} (${i})`, value: i})
        }
        return landmark_menu;
    }

    get VIDEO_MENU () {
        return [
            {
                text: formatMessage({id: 'handsfree2scratch.off'}),
                value: 'off'
            },
            {
                text: formatMessage({id: 'handsfree2scratch.on'}),
                value: 'on'
            },
            {
                text: formatMessage({id: 'handsfree2scratch.onFlipped'}),
                value: 'on-flipped'
            }
        ]
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
                    opcode: 'getLeftHandX',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.getLeftHandX',
                        default: 'x of left hand [LANDMARK]',
                        description: 'Get x of the selected left hand landmark'
                    }),
                    func: 'getLeftHandX',
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getLeftHandY',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.getLeftHandY',
                        default: 'y of left hand [LANDMARK]',
                        description: 'Get y of the selected left hand landmark'
                    }),
                    func: 'getLeftHandY',
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getRightHandX',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.getRightHandX',
                        default: 'x of right hand [LANDMARK]',
                        description: 'Get x of the selected right hand landmark'
                    }),
                    func: 'getRightHandX',
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'getRightHandY',
                    blockType: BlockType.REPORTER,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.getRightHandY',
                        default: 'y of right hand [LANDMARK]',
                        description: 'Get y of the selected right hand landmark'
                    }),
                    func: 'getRightHandY',
                    arguments: {
                        LANDMARK: {
                            type: ArgumentType.STRING,
                            menu: 'landmark',
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'videoToggle',
                    blockType: BlockType.COMMAND,
                    blockAllThreads: false,
                    text: formatMessage({
                        id: 'handsfree2scratch.videoToggle',
                        default: 'turn video [VIDEO_STATE]',
                        description: 'Controls display of the video preview layer'
                    }),
                    func: 'videoToggle',
                    arguments: {
                        VIDEO_STATE: {
                            type: ArgumentType.STRING,
                            menu: 'video',
                            defaultValue: 'off'
                        }
                    }
                },
            ],
            menus: {
                landmark: {
                    acceptReporters: true,
                    items: this.LANDMARK_MENU
                },
                video: {
                    acceptReporters: true,
                    items: this.VIDEO_MENU
                }
            }
        };
    }
}

export {
    ExtensionBlocks as default,
    ExtensionBlocks as blockClass
};
