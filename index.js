#!/usr/bin/env node

//las importaciones

const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const shell = require('shelljs');
const chalk = require('chalk');

const render = require('./utils/templates').render 

//obtener las opcine sde los templettes

const TEMPLATE_OPTIONS= fs.readdirSync(path.join(__dirname,'templates'));

//console.log(TEMPLATE_OPTIONS);

const QUESTIONS=[
    {
        name:'template',
        type:'list',
        message:'¿que tipo de servidor quieres generar?',
        choices:TEMPLATE_OPTIONS 
    },
    {
        name:'proyecto',
        type:'input',
        message:'¿como se llamara tu sevidor?',
        validate: function(input){
            if (/^([a-z@]{1}[a-z\-\.\\\/0-9]{0,213})+$/.test(input)) {
                return true
            }
            return "El nombre del proyecto solo bede de trener 200 carracteres y tiene que empesar en miniscula o con un @"
        }
    }
]


const dirActual=process.cwd();

inquirer.prompt(QUESTIONS).then(res=>{
   
    const template=res['template'];
    const proyecto = res['proyecto'];

    const template_path=path.join(__dirname,'templates',template);
    const pathTarget=path.join(dirActual,proyecto);
   if (! createProject(pathTarget)) {
       return;
   }
    createDirectoriesFilesContent(template_path,proyecto);
    postProccess( template_path,pathTarget);
});




function createProject(projectPath){

    //conpobando que el proyecto no existe
    if (fs.existsSync(projectPath)) {
        console.log(chalk.red('no puedes crear el proyecto por qu ya exs¿iste intenta con otro'))
        return false
    }
    fs.mkdirSync(projectPath);
    return true;
}


//crewacion de directorios y ficheros

function createDirectoriesFilesContent(template_path,projectName) {

    const listFileDirectories=fs.readdirSync(template_path);

    listFileDirectories.forEach(item=>{
        const originalPath=path.join(template_path,item);

        const stast=fs.statSync(originalPath);

        const writePath=path.join(dirActual,projectName,item);

 
        if (stast.isFile()) {
            
            let contents=fs.readFileSync(originalPath,'utf-8');
             contents = render(contents,{projectName});
            fs.writeFileSync(writePath,contents,'utf-8');
            //informacion adicional
            const CREATE = chalk.green('CREATE ');
                const size=stast['size'];
                console.log(`${CREATE} ${originalPath} (${size}) bytes`);
                

        }
        else if (stast.isDirectory()) {
            

            fs.mkdirSync(writePath);
            createDirectoriesFilesContent(path.join(template_path,item),path.join(projectName,item));
        }
    })

}



function postProccess( template_path,pathTarget) {
    
    const isNode=fs.existsSync(path.join(template_path,'package.json'));

    if (isNode) {
        
        shell.cd(pathTarget);
        console.log(chalk.green(`instalando depneddencias en  ${pathTarget}`));
     
        const result = shell.exec('npm install');

        
        if (result != 0) {
            return false
        }

    }


}



