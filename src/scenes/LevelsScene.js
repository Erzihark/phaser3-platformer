import BaseScene from "./BaseScene";


export default class LevelsScene extends BaseScene{
    constructor(config){
        super('LevelsScene', {...config, canGoBack: true});

        
    }

    create(){
        super.create();

        const levels = this.registry.get('unlocked-levels');

        this.menu = [];
        for (let i = 1; i <= levels; i++){
            this.menu.push({
                scene: 'PlayScene', text: `Level ${i}`, level: i
            })
        }

        this.createMenu(this.menu, (menuItem) => this.setupMenuEvents(menuItem));

    }

    setupMenuEvents(menuItem){
        const textGO = menuItem.textGO;
        textGO.setInteractive();

        textGO.on('pointerover', ()=>{
            textGO.setStyle({fill:"#fff"})
        });

        textGO.on('pointerout', ()=>{
            textGO.setStyle({fill:"#713e01"})
        });

        textGO.on('pointerup', ()=>{
            menuItem.scene && this.scene.start(menuItem.scene);

            if(menuItem.scene){
                this.registry.set('level', menuItem.level)
                this.scene.start(menuItem.scene);
            }

            if(menuItem.text === "Exit"){
                this.game.destroy(true);
            }
        });
    }
}


