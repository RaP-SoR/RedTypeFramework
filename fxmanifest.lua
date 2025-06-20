fx_version 'adamant'
games { 'gta5', 'rdr3' }
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'RaPSoR'
description 'CFXType Framework - A framework for Cfx based on TypeScript'
version '0.0.1'


convar 'ctf:debug' 'true'
convar 'ctf:db_host' 'localhost'
convar 'ctf:db_port' '27017'
convar 'ctf:db_name' 'fivem_dev'
convar 'ctf:db_user' ''
convar 'ctf:db_pass' ''

server_script 'dist/core/server/**/*.js'
client_script 'dist/core/client/**/*.js'
shared_script 'dist/core/shared/**/*.js'

ui_page 'dist/ui/index.html'

files {
    'dist/ui/index.html',
    'dist/ui/assets/**/*',
    'dist/ui/favicon.ico'
}

dependencies {
    'cfx-mongodb'
}