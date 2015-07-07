[#-- @ftlvariable name="action" type="com.atlassian.bamboo.ww2.actions.chains.admin.ViewPlanConfiguration" --]
[#-- @ftlvariable name="" type="com.atlassian.bamboo.ww2.actions.chains.admin.ViewPlanConfiguration" --]
[#assign repositories=action.getRepositoryDefinitions('com.atlassian.bamboo.plugin.system.repository:svn', selectedRepositories)/]
[#if repositories?has_content]
    [#list repositories as repositoryDefinition]
        [@ww.hidden name="selectedRepositories" value=repositoryDefinition.id /]
        [#assign repository=repositoryDefinition.repository/]
        [@ww.label labelKey='repository.name' value=repositoryDefinition.name /]
        [@ww.label labelKey='repository.svn.repository' value=repository.repositoryUrl?html /]
    [/#list]
[#else]
    [@ww.text name='bulkAction.repo.notPlugin' /]
[/#if]