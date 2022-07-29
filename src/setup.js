/**
 * Layers setup
 * Based on the implementation from https://gitlab.com/tiwato/fogmanager
 */
Hooks.on('init', () => {
  class AdditionalSavesLayer extends (game.release.generation === 9 ? CanvasLayer : InteractionLayer) {
    constructor () {
      super();
      this.layername = 'additionalsaves';
    }
  }

  const layers = isNewerVersion((game.version ?? game.data.version), '9.00') ? {
    additionalsaves: {
      layerClass: AdditionalSavesLayer,
      group: 'interface'
    }
  } : {
    additionalsaves: AdditionalSavesLayer
  };
  CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);

  if (!Object.is(Canvas.layers, CONFIG.Canvas.layers)) {
    const layers = Canvas.layers;
    Object.defineProperty(Canvas, 'layers', {
      get: function () {
        return foundry.utils.mergeObject(layers, CONFIG.Canvas.layers);
      }
    });
  }
});



