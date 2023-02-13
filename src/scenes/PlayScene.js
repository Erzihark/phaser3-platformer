import Phaser from "phaser";
import Player from "../entities/Player";
import Enemies from "../groups/Enemies";
import Collectables from "../groups/Collectables";
import initAnims from "../anims"
import Hud from "../hud";
import EventEmitter from "../events/Emitter";

class PlayScene extends Phaser.Scene{

    constructor(config){
        super('PlayScene');
        this.config = config;

    }

    create({gameStatus}){
        this.score = 0;

        this.hud = new Hud(this, 0, 0);

        this.playBgMusic();

        const map = this.createMap();
        initAnims(this.anims);
        const layers = this.createLayers(map);
        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones);
        const enemies = this.createEnemies(layers.enemySpawns, layers.platformColliders);
        const collectables = this.createCollectables(layers.collectables);
        this.collectSound = this.sound.add('coin-pickup', {volume: 0.2});

        this.createBG(map);
        
        this.createPlayerColliders(player, {
            colliders: {
                platformColliders: layers.platformColliders,
                projectiles: enemies.getProjectiles(),
                collectables,
                traps: layers.traps,
            }
        });

        this.createEnemyColliders(enemies, {
            colliders: {
                platformColliders: layers.platformColliders,
                player
            }
        });

        this.createaBackButton();
        this.createEndOfLevel(playerZones.end, player);
        this.setupFollowupCameraOn(player);

        if(gameStatus === 'PLAYER_LOSE'){return}

        this.createGameEvents();

    }

    playBgMusic(){
        if(this.sound.get('theme')) return;
        this.sound.add('theme', {loop:true, volume: 0.1}).play();
    }
    
    createMap(){
        const map = this.make.tilemap({key: `level_${this.getCurrentLevel()}`});
        map.addTilesetImage('main_lev_build_1', 'tiles-1');
        map.addTilesetImage('bg_spikes_tileset', 'bg-spikes-tileset');

        return map;
    }

    createLayers(map){
        const tileset = map.getTileset('main_lev_build_1');
        const tilesetBg = map.getTileset('bg_spikes_tileset');

        map.createStaticLayer('distance', tilesetBg).setDepth(-12);

        const environment = map.createStaticLayer('environment', tileset).setDepth(-2);
        const platforms = map.createStaticLayer('platforms', tileset);
        const platformColliders = map.createStaticLayer('platform-colliders', tileset);
        const playerZones = map.getObjectLayer('player-zones').objects;
        const enemySpawns = map.getObjectLayer('enemy-spawns').objects;
        const collectables = map.getObjectLayer('collectables').objects;
        const traps = map.createStaticLayer('traps', tileset);
        platformColliders.setCollisionByExclusion(-1, true);
        traps.setCollisionByExclusion(-1);

        return {environment, platforms, platformColliders, playerZones, enemySpawns, collectables, traps}
    }

    createBG(map){
        const bgObject = map.getObjectLayer('distance-bg').objects[0];
        this.spikesImage = this.add.tileSprite(bgObject.x, bgObject.y, this.config.width, bgObject.height, 'bg-spikes-dark')
        .setOrigin(0, 1).setDepth(-10).setScrollFactor(0, 1);

        this.skyImage = this.add.tileSprite(0, 0, this.config.width, 180, 'sky-play')
        .setOrigin(0, 0).setDepth(-11).setScale(1.1).setScrollFactor(0, 1);
    }

    createaBackButton(){
        const btn = this.add.image(this.config.rightBottomCorner.x, this.config.rightBottomCorner.y, 'back')
        .setOrigin(1).setScrollFactor(0).setScale(2).setInteractive();

        btn.on('pointerup', ()=>{
            this.scene.start('MenuScene');
        })
    }

    createGameEvents(){
        EventEmitter.on('PLAYER_LOSE', ()=>{
            this.scene.restart({gameStatus:"PLAYER_LOSE"});
        })
    }

    createCollectables(collectableLayer){
        const collectables = new Collectables(this).setDepth(-1);

        collectables.addFromLayer(collectableLayer);

        collectables.playAnimation('diamond-shine');
        
        return collectables;
    }

    createPlayer({start}){
        return new Player(this, start.x, start.y);  
    }

    createEnemies(spawnLayer, platformColliders){
        const enemies = new Enemies(this);
        const enemyTypes = enemies.getTypes();

        spawnLayer.forEach((spawnPoint, i) => {
            const enemy = new enemyTypes[spawnPoint.properties[0].value](this, spawnPoint.x, spawnPoint.y);
            enemy.setPlatformColliders(platformColliders)
            enemies.add(enemy);
        });

        return enemies;
    }

    onPlayerCollision(enemy, player){
        player.takesHit(enemy);
    }

    onHit(entity, source){
        entity.takesHit(source)        
    }

    onCollect(entity, collectable){
        //disable game object
        this.score += collectable.score;
        this.hud.updateScoreboard(this.score);
        this.collectSound.play();
        collectable.disableBody(true, true);        
    }

    createPlayerColliders(player, {colliders}){
        player.addCollider(colliders.platformColliders)
        .addCollider(colliders.projectiles, this.onHit)
        .addCollider(colliders.traps, this.onHit)
        .addOverlap(colliders.collectables, this.onCollect, this);
    }

    createEnemyColliders(enemies, {colliders}){
        enemies
            .addCollider(colliders.platformColliders)
            .addCollider(colliders.player, this.onPlayerCollision)
            .addCollider(colliders.player.projectiles, this.onHit)
            .addOverlap(colliders.player.meleeWeapon, this.onHit);
    }

    setupFollowupCameraOn(player){
        const {height, width, mapOffset, zoomFactor} = this.config;
        this.physics.world.setBounds(0, 0, width + mapOffset, height + 200);
        this.cameras.main.setBounds(0,0, width + mapOffset, height).setZoom(zoomFactor);
        this.cameras.main.startFollow(player);
    }

    getPlayerZones(playerZonesLayer){
        return {
            start: playerZonesLayer.find(zone => zone.name === 'startZone'),
            end: playerZonesLayer.find(zone => zone.name === 'endZone')
        }
    }

    getCurrentLevel(){
        return this.registry.get('level') || 1;
    }

    createEndOfLevel(end, player){
        const endOfLevel = this.physics.add.sprite(end.x, end.y, 'end').setAlpha(0).setSize(5, 200).setOrigin(0.5, 1);

        const eolOverlap = this.physics.add.overlap(player, endOfLevel, ()=>{
            eolOverlap.active = false;

            if(this.registry.get('level') === this.config.lastLevel){
                this.scene.start('CreditsScene');
                return;
            }

            this.registry.inc('level', 1);
            this.registry.inc('unlocked-levels', 1);

            this.scene.restart({gameStatus: 'LEVEL_COMPLETED'});
        });
    }

    update(){
        this.spikesImage.tilePositionX = this.cameras.main.scrollX * 0.2;
        this.skyImage.tilePositionX = this.cameras.main.scrollX * 0.1;

    }
    
}

export default PlayScene;