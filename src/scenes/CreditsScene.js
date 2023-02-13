import BaseScene from "./BaseScene";


export default class CreditsScene extends BaseScene{
    constructor(config){
        super('CreditsScene', {...config, canGoBack: true});

        this.menu = [
            {scene: null, text: 'Thank you for playing'},
            {scene: null, text: 'Author: Manuel'}
        ]
    }

    create(){
        super.create();
        //this.scene.start('PlayScene')

        this.createMenu(this.menu, ()=>{});

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

            if(menuItem.text === "Exit"){
                this.game.destroy(true);
            }
        });
    }
}
