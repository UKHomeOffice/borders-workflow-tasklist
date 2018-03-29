const port = process.env.PORT || 8080;

const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const proxy = require('http-proxy-middleware');


const respond = (req, res) => {
    res.send('OK');
};

process.title = 'borders-workflow-tasklist';

app.set('port', port);

app.use(express.static(__dirname + "/"));

app.get('/healthz', respond);
app.get('/readiness', respond);

console.log("prest name " + process.env.PREST_NAME);
console.log("workflow name " + process.env.WORKFLOW_NAME);
console.log("formio name " + process.env.FORM_IO_NAME);
console.log("bpmn modeler name " + process.env.WORKFLOW_MODELER);

const domain = process.env.DOMAIN;

const prestName = process.env.PREST_NAME;
const workflowName =process.env.WORKFLOW_NAME;
const formIOName = process.env.FORM_IO_NAME;
const bpmnModelerName = process.env.WORKFLOW_MODELER;

const prestUrl = `https://${prestName}.${process.env.INT_DOMAIN}`;
const workflowUrl = `https://${workflowName}.${domain}`;
const formIOUrl = `https://${formIOName}.${domain}`;
const bpmnModelerUrl =  `https://${bpmnModelerName}.${domain}`;
const prestDatabaseName = process.env.TX_DB_NAME;


console.log("prestUrl " + prestUrl);
console.log("workflowUrl " + workflowUrl);
console.log("formIOUrl " + formIOUrl);
console.log("bpmnModeler " + bpmnModelerUrl);


app.use('/api/reference-data', proxy(
    {
        target: prestUrl,
        pathRewrite: {
            '^/api/reference-data/_QUERIES' : `/_QUERIES/read`,
            '^/api/reference-data' : `/${prestDatabaseName}/public`
        },
        onProxyReq: function onProxyReq(proxyReq, req, res) {
            console.log('Prest Proxy -->  ', req.method, req.path, '-->', prestUrl, proxyReq.path);
        },
        onError: function onError(err, req, res) {
            console.error(err);
            res.status(500);
            res.json({error: 'Error when connecting to remote server.'});
        },
        logLevel: 'debug',
        changeOrigin: true,
        secure: false
    }
));


app.use('/api/workflow', proxy({
    target: prestUrl,
    onProxyReq: function onProxyReq(proxyReq, req, res) {
        console.log('Workflow Proxy -->  ', req.method, req.path, '-->', workflowUrl, proxyReq.path);
    },
    onError: function onError(err, req, res) {
        console.error(err);
        res.status(500);
        res.json({error: 'Error when connecting to remote server.'});
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false
}));


app.use('/api/form', proxy(
    {
        target: formIOUrl,
        pathRewrite: {
            '^/api/form' : '/form'
        },
        onProxyReq: function onProxyReq(proxyReq, req, res) {
            console.log('Form IO Proxy -->  ', req.method, req.path, '-->', formIOUrl, proxyReq.path);
        },
        onError: function onError(err, req, res) {
            console.error(err);
            res.status(500);
            res.json({error: 'Error when connecting to remote server.'});
        },
        logLevel: 'debug',
        changeOrigin: true,
        secure: false
    }
));


app.get('/api/config', (req,res) => {
   res.send({
       'REALM': process.env.REALM,
       'AUTH_URL': process.env.AUTH_URL,
       'CLIENT_ID': process.env.CLIENT_ID,
       'MODELER_URL' : bpmnModelerUrl
   })
});

app.all('*', function (req, res) {
    console.log("Request to tasklist");
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app).listen(app.get('port'), function () {
    console.log('TaskList Prod server listening on port ' + app.get('port'));
});

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
process.on('SIGQUIT', shutDown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutDown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}


