fx_version 'adamant'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'RaPSoR'
description 'RedType Framework - A framework for RedM based on TypeScript'
version '0.0.1'

server_script 'dist/server.js'
client_script 'dist/client.js'
shared_script 'dist/shared.js'

ui_page 'dist/ui/index.html'

files {
    'dist/ui/index.html',
    'dist/ui/assets/**/*',
    'dist/ui/favicon.ico'
}
