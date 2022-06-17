const electron = require('electron');
const {app, BrowserWindow, Menu, ipcMain,dialog} = electron;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.env.NODE_ENV = 'production';

let mainWindow;
let addOrderWindow;
var zamowienia = [];

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    });
    mainWindow.loadFile('mainWindow.html');
    mainWindow.on('close',() => {
        app.quit();
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

const mainMenuTemplate = [
    {
        label:'Profil',
        submenu:[
            {
                label:'Złóż zamówienie',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    createAddOrderWindow();
                }
            },
            {
                label:'Moje zamówienia',
                click(){
                    mainWindow.loadFile('profil.html');
                    mainWindow.webContents.on('did-finish-load', () => {
                        mainWindow.webContents.send('zamowienia:wyswietl',zamowienia);
                    })
                    
                }
            }
        ]
    },
    {
        label:'Piekarnia',
        submenu:[
            {
                label:'Aktualne oferty',
                click(){
                    mainWindow.loadFile('mainWindow.html');
                }
            }
        ]
    }
]

function createAddOrderWindow(){
    addOrderWindow = new BrowserWindow({
        width:300,
        height:180,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    });
    if(process.env.NODE_ENV == 'production')
        addOrderWindow.removeMenu();
    addOrderWindow.loadFile('addOrder.html');
    addOrderWindow.on('close',() => {
        addOrderWindow=null;
    })
}

ipcMain.on('zamowienia:dodaj', (e,zamowienie) => {
    if(zamowienie.ilosc > 0){
        zamowienia.push(zamowienie);
        mainWindow.webContents.send('zamowienia:wyswietl',zamowienia);
        addOrderWindow.close();
    }
    else{
        let options = {
            type:'warning',
            buttons: ['Popraw','Anuluj'],
            defaultId: 0,
            message: 'Ilosc zamawianego towaru nie moze byc rowna 0',
            title:'Niepoprawna ilosc towaru'
        }
        dialog.showMessageBox(null,options).then((data) => {
            if(data.response == 1)
                addOrderWindow.close();
        });
    }
    
})





if(process.platform == 'darwin')
    mainMenuTemplate.unshift({});

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'DeveloperTools',
        submenu:[
            {
                label:'Toogle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload'
            }
        ]
    })
}