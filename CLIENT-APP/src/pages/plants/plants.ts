import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, IonicPage, NavController, ActionSheetController } from 'ionic-angular';
import 'rxjs/add/operator/map';

import { Plant } from "../../models/models";
import { Strain } from "../../models/models";
import { DbProvider } from "../../providers/providers";

import moment from 'moment';
import 'moment/locale/it';

@IonicPage()
@Component({
    selector: 'page-plants',
    templateUrl: 'plants.html'
})
export class PlantsPage implements OnInit {

    plants: Plant[] = [];
    elapsedTime: number;
    shownItem:any;
    today: any;

    constructor(
        private readonly dbProvider: DbProvider,
        private readonly modalCtrl: ModalController,
        private readonly loadingCtrl: LoadingController,
        public navCtrl: NavController,
        public actionSheetCtrl: ActionSheetController
    ) {}

    ngOnInit() {
        this.today = new Date().getTime() / 1000;
        this.dbProvider.initProvider().then(() => { 
            this.filterPlantsPage(true).then(() => {});
        })
    }

    info(strain:Strain){
        console.log(strain)
    }

    openItem(item: Plant) {
        this.navCtrl.push('PlantsDetailPage', { item: item });
    }

    editItem(item: Plant) {
        //this.navCtrl.push('PlantsDetailPage', { item: item });
        console.log("ciao",item)
    }

    deleteItem(item: Plant) {
        //this.navCtrl.push('PlantsDetailPage', { item: item });
        console.log(item)
    }

    doRefresh(refresher) {
        this.dbProvider.initProvider().then(() => { 
            this.filterPlantsPage(true).then(() => refresher.complete());
        })
    }

    // getPath(tasks, actualTask, daysum) {
    //     //console.log(tasks, actualTask, daysum)
    //     if(!actualTask["day"] ) {
            
    //         daysum += " "+actualTask["time_gap"] ;
    //         let row = tasks.filter(function( obj ) {
    //             return obj.id == actualTask["id_rif_task"]
    //         });
    //         console.log(tasks, row, daysum)
    //         return this.getPath(tasks, row, daysum);
    //     }else{
    //         return actualTask[0]["day"] + daysum;
    //     } 
    // }

    async getFullInfo(plant): Promise<any> {
        moment.locale('it');
        return new Promise(resolve => {
            let previous_task_done = 0;
            for (let el in plant.man_tasks) {
                let row = plant.man_tasks[el];   
                if(row["day"]){ // segnato come fatto (quindi passato?)
                    if(row["mandatory"]){
                        previous_task_done = 1;

                        plant["calendar_macrotask_image"] = row["icon"];
                        plant["calendar_macrotask_date"] = row["day"];
                    }
                    plant["tasks_time"] = moment(moment.unix(row["day"])).unix();
                }else{ 
                    let parent = plant.man_tasks.filter(function( obj ) { return obj.id == row["id_rif_task"]; });
                    let estimatedDateSum = row["time_gap"].split(" ");
                    row["estimated_day"] = moment.unix((parent[0]["day"] ? parent[0]["day"] : parent[0]["estimated_day"])).add(parseInt(estimatedDateSum[0]), estimatedDateSum[1]).unix();
                    
                    if( this.today > row["estimated_day"] ){ //evento passato non fatto
                       //console.log(plant["id"])
                        plant["tasks_class"] = "danger";
                        plant["tasks_alert"] = row["name"];
                        plant["tasks_icon"]  = row["icon"];   
                        plant["tasks_time"]  = row["estimated_day"];    
                    }else{
                        if( this.today > moment.unix(row["estimated_day"]).subtract(2,"weeks").unix()){ //evento nel prossimo mese (solo 1)
                           //console.log(plant["id"])
                            plant["tasks_class"] = "secondary";
                            plant["tasks_alert"] = row["name"];
                            plant["tasks_icon"]  = row["icon"];
                            plant["tasks_time"]  = row["estimated_day"]; 
                            previous_task_done = 1;
                            console.log(plant["id"],plant["tasks_alert"],plant["tasks_class"],plant["tasks_time"])
                        }
                    }
                }
                
            }

            this.dbProvider.filterStrains(plant["id_strain"]).then((strain) => {
                plant["strain"] = strain;
                this.dbProvider.filterCompanies(plant["id_company"]).then((company) => {
                    plant["company"] = company;
                    resolve();
                })
            })
        });
        
        
    }

    toggleItem(item) {
        if (this.isItemShown(item)) {
            this.shownItem = null;
        } else {
            this.shownItem = item;
        }
    };
    isItemShown = function(item) {
        return this.shownItem === item;
    };


    async filterPlantsPage(hideLoading = false) {
        let loading = null;
        if (!hideLoading) {
            loading = this.loadingCtrl.create({
                content: 'Please wait...'
            });
            loading.present();
        }

        const start = performance.now();
        var plants = await this.dbProvider.filterPlants();
        var promises = [];
        for (let el in plants) {
            let row = plants[el];
            promises.push(this.getFullInfo(row));
            
        }

        Promise.all(promises).then(() => {
            console.log(plants);
            this.plants = plants;
        });

    }

    identify(index, item) {
        return item.id;
    }

    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
          title: 'Add New',
          buttons: [
            {
              text: 'Plant',
              //role: 'destructive',
              handler: () => {
                console.log('Destructive clicked');
              }
            },{
              text: 'Strain',
              handler: () => {
                console.log('Archive clicked');
              }
            },{
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            }
          ]
        });
        actionSheet.present();
      }
}
