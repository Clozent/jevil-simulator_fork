/* This file handles the flow of each turn

turnPhase values (not necessarily final):
0: Kris selection
1: Susie selection
2: Ralsei selection
TODO: shift other turnPhase numbers to adjust for removal of turnPhases 3-5
6: Kris action
7: Susie action
8: Ralsei action
9: player's attack
10: Jevil's line (and attack setup)
12: Jevil's attack
13: turn reset (single frame)
*/

import { attacks, attackData, executeAttack } from "./attack_handler.js";

/**
 * Moves the character selection to the next available game phase.
 *
 * @param {Game} game - The game object.
 */
const phaseForward = function(game) {
	const { party, turnPhase} = game;
	
	let steps = 1;

	// Check if the phase is already at the party's maximum value.
	if (turnPhase + steps <= 2) {
		// Scan the party forwards for an alive member.
		while (party[turnPhase + steps].current.hp <= 0) {
			steps += 1;
			if (turnPhase + steps > 2) {
				break;
			}
		}
	}
	game.turnPhase += steps;
}

/**
 * Moves the character selection to the previous available phase.
 *
 * @param {Game} game - The game object
 */
const phaseBack = function(game) {
	const { party, turnPhase} = game;
	
	let steps = -1;

	// Check if the phase is already at it's minimum value.
	if (turnPhase + steps >= 0) {
		// Check if the phase is already at the party's maximum value.
		if (turnPhase + steps <= 2) {
			// Scan the party backwards for an alive member.
			while (party[turnPhase + steps].current.hp <= 0) {
				if (turnPhase + steps < 1) {
					break;
				}
				steps -= 1;
			}
		}
	}
	else {
		steps = 0;
	}
	game.turnPhase += steps;
}

const processTurn = function(game) {
	const { sketch, keys, keyNames, party } = game;

	sketch.text(game.turnPhase, 610, 25); // for debugging purposes

	switch (game.turnPhase) {
	case 0:
	case 1:
	case 2:
		// When current character is down
		if (party[game.turnPhase].current.hp <= 0) {
			phaseForward(game);
		}

		// When an option is selected
		if (keys.isPressed(keyNames.select)) {
			if(game.turnPhase != 2) {
				phaseForward(game);
			}
			else {
				phaseForward(game);
			}
		}

		// When pressing cancel
		if (keys.isPressed(keyNames.cancel) && game.turnPhase != 0) {
			// Move to a previous character that is alive.
			phaseBack(game);
			}
		}
		//fallthrough
	/*case 0:
		if (game.turnPhase <= 2 && party[game.turnPhase].current.hp <= 0) {
			game.turnPhase++;
		}*/

		
		break;
	// skipping some cases here for now; I want to start adding Jevil's attacks ASAP
	case 10:
		game.textBox.clear();

		attacks[attackData.id].prepareAttack();
		game.turnPhase++;
		break;

	case 11:
		executeAttack(game);
		break;

	case 12:
		attackData.bullets = [];
		attackData.iFrames = 0;
		for (let i = 2; i >= 0; i--) {
			party[i].menuSelection = { category: 0, suboption: 0 };
			if (party[i].current.hp <= 0) {
				party[i].current.hp += Math.floor(party[i].current.maxHp / 7.5);
			}
			if (party[i].current.hp > 0) {
				game.turnPhase = i * 2;
			}
		}
		if (game.turnPhase === 12) {
			game.turnPhase = 6;
		}
		break;
	default:
		game.turnPhase++;
	}
};

export { processTurn };
