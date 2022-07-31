// /**
//  * Layers setup
//  * Based on the implementation from https://gitlab.com/tiwato/fogmanager
//  */
// Hooks.on('init', () => {
//   class AdditionalSavesLayer extends (game.release.generation === 9 ? CanvasLayer : InteractionLayer) {
//     constructor () {
//       super();
//       this.layername = 'additionalsaves';
//     }
//   }
//
//   const layers = isNewerVersion((game.version ?? game.data.version), '9.00') ? {
//     additionalsaves: {
//       layerClass: AdditionalSavesLayer,
//       group: 'interface'
//     }
//   } : {
//     additionalsaves: AdditionalSavesLayer
//   };
//   CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);
//
//   if (!Object.is(Canvas.layers, CONFIG.Canvas.layers)) {
//     const layers = Canvas.layers;
//     Object.defineProperty(Canvas, 'layers', {
//       get: function () {
//         return foundry.utils.mergeObject(layers, CONFIG.Canvas.layers);
//       }
//     });
//   }
// });



//This doesn't really help much, as soon as you try to click, it deselects any selected tokens 🙃
//Maybe should be added back in via a popup instead, little bit useless if it can't keep the selected tokens
/*
Hooks.on('getSceneControlButtons', (controls) => {
  controls.push({
    name: 'additional-saves',
    title: 'Additional Saves',
    icon: 'fas fa-dice-d20',
    layer: 'additionalsaves',
    tools: [
      {
        name: 'fortitude',
        title: 'Fortitude Save',
        icon: 'fas fa-fist-raised',
        onClick: async () => {
          log('fortitude');
          createRollOfType('fortitude');
        },
        button: true,
      },
      {
        name: 'reflex',
        title: 'Reflex Save',
        icon: 'fas fa-angle-double-right',
        onClick: () => {
          log('reflex');
          createRollOfType('reflex');
        },
        button: true,
      },
      {
        name: 'will',
        title: 'Will Save',
        icon: 'fas fa-brain',
        onClick: () => {
          log('will');
          createRollOfType('will');
        },
        button: true,
      },
    ]
  });
});
*/
