const express = require('express')
const pug = require('pug')
const redis = require('redis')
const fs = require('fs')
const app = express()
const rank = redis.createClient()
const bodyParser = require('body-parser')

const maxExo = fs.readdirSync('exercices/').length
const homepage = fs.readFileSync('teamname.html', "UTF-8")
const exo2 = fs.readFileSync('exo2.html', "UTF-8")
const image = fs.readFileSync('resultat.png')//, "UTF-8")
const send_nudes = pug.compileFile("exercice.pug")

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  res.send(homepage)
})

app.get('/image.png', function(req,res){
	res.set('Content-Type', 'image/png');
    res.sendFile("./resultat.png",{root:'.'})
})

app.get('/exo2.html', function(req,res){
    res.send(exo2)
})

app.get('/exercice/image.png', function(req,res){
	res.set('Content-Type', 'image/png');
    res.sendFile("./resultat.png",{root:'.'})
})

app.get('/exercice/exo2.html', function(req,res){
    res.send(exo2)
})

app.post('/exercice/', function(req,res){
    let teamname = req.body.teamname
    //if ()
    rank.get(teamname,function(err,reply){
        let teamrank = Number(reply)
        if (teamrank > maxExo){
            res.send("<h1>Félicitations ! Vous avez terminé !</h1><p>Merci à Gabriel Chênevert pour son aide à la conception des exercices.</p>")
        } else if (teamrank <= 0){
            res.send("Exercice inconnu")
        } else
        res.send(send_nudes({n:reply, exercice: exercice[teamrank].question, teamname: teamname}))
    })
})

app.get('/exercice/', function(req, res){
    res.redirect('/')
})

app.post('/validation', function(req,res){
    let teamname = req.body.teamname
    rank.get(teamname,function(err,reply){
        if (req.body.password == exercice[reply].answer){
            console.log("Equipe "+teamname+" termine l'exercice " + reply + " à " + Date())
            rank.incr(teamname)
        }
    res.redirect(307,"/exercice")
    })
})

app.post('/start', function(req,res){
    let teamname = req.body.teamname
    if (teamname == undefined)
        res.redirect('/')
    let teamrank = 1
    rank.get(teamname,function(err,reply){
        if (reply == null)
            rank.set(teamname,"1")
        else
            teamrank = reply
    })
    res.redirect(307,'/exercice/')
})

var exercice = new Array()
// Read JSON
for (let i = 1; i <= maxExo; i++){
    fs.readFile('exercices/'+i+'.json',function(err,data){
        exercice[i] = JSON.parse(data)
    })
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
