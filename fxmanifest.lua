fx_version 'adamant'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

author 'RaPSoR'
description 'RedType Framework - A framework for RedM based on TypeScript'
version '0.0.1'


convar 'rtf:debug' 'true'
convar 'rtf:db_host' 'localhost'
convar 'rtf:db_port' '27017'
convar 'rtf:db_name' 'redtype-framework'
convar 'rtf:db_user' ''
convar 'rtf:db_pass' ''

server_script 'dist/core/server/**/*.js'
client_script 'dist/core/client/**/*.js'
shared_script 'dist/core/shared/**/*.js'

ui_page 'dist/ui/index.html'

files {
    'dist/ui/index.html',
    'dist/ui/assets/**/*',
    'dist/ui/favicon.ico'
}
