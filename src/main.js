
import './setup.js'

const modifiers = {
  str: {name: 'Strength', code: 'str'},
  con: {name: 'Constitution', code: 'con'},
  dex: {name: 'Dexterity', code: 'dex'},
  int: {name: 'Intelligence', code: 'int'},
  wis: {name: 'Wisdom', code: 'wis'},
  cha: {name: 'Charisma', code: 'cha'}
};

const saveTypes = {
  fortitude: {
    name: 'Fortitude',
    mods: [modifiers.str, modifiers.con],
    macroID: "YWqX4YpladH2RKjT"
  },
  reflex: {
    name: 'Reflex',
    mods: [modifiers.dex, modifiers.int],
    macroID: "YJTJqV9bnjlSbaf5"
  },
  will: {
    name: 'Will',
    mods: [modifiers.wis, modifiers.cha],
    macroID: "KsAPgPPKal7ClI60"
  }
};

function log (...data) {
  console.log('sylris-saves: ', ...data);
}

function convertOldToNew(save){
  switch(save){
    case "str":
    case "con":
      return saveTypes.fortitude
    case "dex":
    case "int":
      return saveTypes.reflex
    case "wis":
    case "cha":
      return saveTypes.will
    default:
      return undefined;
  }
}

function getUserData () {
  let userData = {id: game.data.userId};
  for (let user of game.data.users) {
    if (user._id === userData.id) {
      userData.characterName = user.character;
    }
  }
  return userData;
}

function createChatMessage(message){
  const chatData = {
    user: game.userId,
    speaker: ChatMessage.getSpeaker(),
    content: message
  };
  ChatMessage.create(chatData, {});
}

function createRollMessage(rollData, type, original, tokenName, tokenID){
  const roll = new Roll(`1d20 + ${rollData.modifier}`);
  const speakerData =  JSON.parse(JSON.stringify(ChatMessage.getSpeaker()));
  //Alias is the name displayed
  speakerData.alias = tokenName;
  //Actor is the image displayed with chat-images module
  speakerData.actor = tokenID;
  let chatData = {
    user: game.userId,
    speaker: speakerData,
    flavor: `${type} Saving Throw (${original})`,
  };
  roll.toMessage(chatData);
}

function createRollOfType (type, modifier = 0, advantage = false, disadvantage = false) {
  const saveType = saveTypes[type?.toLowerCase()];
  if (!saveType) {
    throw new Error('sylris-saves: invalid roll type passed to create roll dialog');
  }

  if (!canvas.tokens.controlled.length && !getUserData().id) {
    createChatMessage(`No tokens selected or owned for ${saveType.name} Save\nSelect a token before rolling`)
  } else {
    if (canvas.tokens.controlled.length) {
      //Can't control tokens that aren't owned, so no need to check ownership
      for (let tokens of canvas.tokens.controlled) {
        const name = tokens.actor.data.name;
        const mods = tokens.actor.data.data.abilities;
        if (mods) {
          let saveMod = {
            name: 'n/a',
            value: -Infinity
          };
          for (let abil of saveType.mods) {
            if (saveMod.value < mods[abil.code].save) {
              saveMod.value = mods[abil.code].save;
              saveMod.name = abil.name;
              saveMod.code = abil.code;
            }
          }
          if (saveMod.name !== 'n/a' && saveMod.value > -Infinity) {
            createRollMessage({modifier: saveMod.value}, saveType.name, saveMod.code, name, tokens.actor.data._id);
          } else {
            ui.notifications.warn(`Failed to values for ${name}`)
          }
        }
        else{
          ui.notifications.warn(`Failed to get data for name`)
        }
      }
    }
    else{
      //canvas.tokens.documentCollection.entries?
      //No tokens selected, use the assigned character instead
      ui.notifications.warn(`No token(s) selected, please select at least one token before attempting to roll. Defaulting to owned placed tokens not supported yet.`)
    }
  }

}

function checkChatMessage (messageContent) {
  /*
    <div class="card-buttons red-card-buttons" data-id="2">
      <button data-action="save" data-ability="wis">
          Save DC
          <span style="display:inline;line-height:inherit">19</span>
          Wisdom
      </button>
    </div>
   */

  //Check there's a save button being displayed
  const save = messageContent.match(/button data-action="save" data-ability="([str|con|dex|int|wis|cha]+)"/)?.[1];
  if (save) {
    const dc = messageContent.match(/<span style="display:inline;line-height:inherit">(\d+)<\/span>/m)?.[1] ?? "N/A";
    const newSave = convertOldToNew(save)?.name;
    if (newSave) {
      createChatMessage(`DC ${dc} ${newSave} Save`);
    }
  }
}

Hooks.on('renderChatMessage', (message, html, data)=>{
  checkChatMessage(data.message.content);
  //TODO: modify the button in the response and use that for the roll
})

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


//For macro access
window.AdditionalSaves = createRollOfType;



/*

game.data.packs
canvas.tokens.documentCollection.entries

 */