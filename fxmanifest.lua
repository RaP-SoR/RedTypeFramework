fx_version 'cerulean'
games { 'gta5' }

author 'RaPSoR'
description 'CFXType Framework - A framework for Cfx based on TypeScript'
version '0.0.1'

convar 'ctf:debug' 'true'
convar 'ctf:db_host' 'localhost'
convar 'ctf:db_port' '27017'
convar 'ctf:db_name' 'fivem_dev'
convar 'ctf:db_user' ''
convar 'ctf:db_pass' ''

dependencies {
    'cfx-mongodb',
    '/server:7290',
    '/onesync',
}

-- Shared scripts (Basis-Klassen und Utils zuerst)
shared_script 'dist/shared/Vector3.js'
shared_script 'dist/shared/logs.js'
--shared_script 'dist/shared/shared.js'

-- Shared interfaces (können leer sein, aber müssen geladen werden)
shared_script 'dist/shared/interfaces/DBConfig.js'
shared_script 'dist/shared/interfaces/IBaseModel.js'
shared_script 'dist/shared/interfaces/IDatabaseProvider.js'
shared_script 'dist/shared/interfaces/IEntity.js'
shared_script 'dist/shared/interfaces/IRepository.js'
shared_script 'dist/shared/interfaces/ServerConfig.js'
shared_script 'dist/shared/events/server.js'

-- Server scripts (Abhängigkeiten zuerst)
server_script 'dist/server/db/providers/CFXMongoDBProvider.js'
server_script 'dist/server/db/DatabaseFactory.js'
server_script 'dist/server/entity/entityManager.js'
server_script 'dist/server/server-core.js'
server_script 'dist/server/server.js'

-- Client scripts
--client_script 'dist/client/entityManger/blip.js'
--client_script 'dist/client/entityManger/entityManager.js'
--client_script 'dist/client/client.js'

-- UI files
--ui_page 'dist/ui/index.html'

--files {
  --  'dist/ui/index.html',
    --'dist/ui/assets/**/*',
    --'dist/ui/favicon.ico'
--}

-- Export für andere Ressourcen
server_export 'getServer'