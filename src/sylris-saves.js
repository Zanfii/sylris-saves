import './setup.js';

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
    macroID: 'YWqX4YpladH2RKjT'
  },
  reflex: {
    name: 'Reflex',
    mods: [modifiers.dex, modifiers.int],
    macroID: 'YJTJqV9bnjlSbaf5'
  },
  will: {
    name: 'Will',
    mods: [modifiers.wis, modifiers.cha],
    macroID: 'KsAPgPPKal7ClI60'
  }
};
const appliedMessages = [];

function log (...data) {
  console.log('sylris-saves: ', ...data);
}

function convertOldToNew (save) {
  switch (save) {
    case 'str':
    case 'con':
      return saveTypes.fortitude;
    case 'dex':
    case 'int':
      return saveTypes.reflex;
    case 'wis':
    case 'cha':
      return saveTypes.will;
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

function createChatMessage (message) {
  const chatData = {
    user: game.userId,
    speaker: ChatMessage.getSpeaker(),
    content: message
  };
  ChatMessage.create(chatData, {});
}

function createRollMessage (rollData, type, original, tokenName, tokenID) {
  const roll = new Roll(`1d20 + ${rollData.modifier}`);
  const speakerData = JSON.parse(JSON.stringify(ChatMessage.getSpeaker()));
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
    createChatMessage(`No tokens selected or owned for ${saveType.name} Save\nSelect a token before rolling`);
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
            ui.notifications.warn(`Failed to values for ${name}`);
          }
        } else {
          ui.notifications.warn(`Failed to get data for name`);
        }
      }
    } else {
      //canvas.tokens.documentCollection.entries?
      //No tokens selected, use the assigned character instead
      ui.notifications.warn(`No token(s) selected, please select at least one token before attempting to roll.`);
    }
  }

}

function checkChatMessage (messageContent, isPoster, isLogged, messageID) {
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
  if (isPoster && !isLogged && !appliedMessages.includes(messageID)) {
    appliedMessages.push(messageID);
    const save = messageContent.match(/button data-action="save" data-ability="([str|con|dex|int|wis|cha]+)"/)?.[1];
    if (save) {
      const dc = messageContent.match(/<span style="display:inline;line-height:inherit">(\d+)<\/span>/m)?.[1] ?? 'N/A';
      const newSave = convertOldToNew(save)?.name;
      if (newSave) {
        const className = `sylris-saves-${newSave}`;
        createChatMessage(`${newSave} Save<br/><button class=${className}>DC ${dc} ${newSave} Save</button>`);
        //100ms delay for the chat message to get logged
        setTimeout(() => {
          const buttons = document.getElementsByClassName(`sylris-saves-${newSave}`);
          for (let button of buttons) {
            if (button) {
              button.onclick = () => {createRollOfType(newSave)};
            }
          }
        }, 100);
      }
    }
  } else {
    const save = messageContent.match(/DC [0-9 ]+([Reflex|Fortitude|Will]+) Save/i)?.[1];
    if (save) {
        //100ms delay for the chat message to get logged
        setTimeout(() => {
          const buttons = document.getElementsByClassName(`sylris-saves-${save}`);
          for (let button of buttons) {
            if (button) {
              button.onclick = () => {createRollOfType(save)};
            }
          }
        }, 100);
      }
    }
}

Hooks.on('renderChatMessage', (message, html, data) => {
  const isPoster = data.message.user === data.user.data._id;
  log(message, html, data)
  checkChatMessage(data.message.content, isPoster, message.logged, message.data._id);
  //TODO: modify the button in the response and use that for the roll
})


//For macro access
window.AdditionalSaves = createRollOfType;