<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  version="3.0">

  <xsl:output
    method="text"
    encoding="UTF-8"
    indent="no"
    omit-xml-declaration="yes" />

  <xsl:strip-space elements="*"/>

  <xsl:variable name="json-source" select="//@config-source"/>
  <xsl:variable name="api-config" select="json-doc($json-source)"/>
  <xsl:variable name="descriptions" select="//propDescriptions"/>

  <xsl:template match="/">

    <!-- output par défaut : yaml -->
    <xsl:apply-templates/>

    <!-- output supplémentaire : js-comment -->
    <xsl:result-document
      href="display-doc-api.txt"
      method="text"
      omit-xml-declaration="true">

      <xsl:variable name="prefix">
        <xsl:text>&#10; *</xsl:text>
      </xsl:variable>

      <xsl:variable name="js-comment">
        <xsl:apply-templates/>
      </xsl:variable>

      <xsl:analyze-string select="$js-comment" regex=".*">
        <xsl:matching-substring>
          <xsl:value-of select="
            string-join(
            for $l in tokenize(., '\r?\n')
            return concat($prefix, $l),
            '&#10;'
            )
            "/>
        </xsl:matching-substring>
      </xsl:analyze-string>
      <xsl:text>&#10;</xsl:text>

    </xsl:result-document>

  </xsl:template>

  <xsl:template match="documentation">
    <xsl:apply-templates select="*/entities"/>
  </xsl:template>

  <xsl:template match="entities/*">

    <!-- id -->
    <xsl:variable name="id" select="@id"/>

    <!--$ref-->
    <xsl:variable name="ref">
      <xsl:choose>
        <xsl:when test="@range"><xsl:value-of select="@range"/></xsl:when>
        <xsl:otherwise><xsl:value-of select="@id"/></xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!--$entity-->
    <xsl:variable name="entity" select="."/>
    <xsl:variable name="excluded" select="excludeProperties/*/name()"/>

    <!--Boucle sur la config d’API-->
    <xsl:for-each select="$api-config?model?*">
      <xsl:if test="$id = ?id">

        <!-- id + type -->
        <xsl:text>&#10;     </xsl:text><xsl:value-of select="$ref"/><xsl:text>:</xsl:text>
        <xsl:text>&#10;       type: object</xsl:text>
        <xsl:if test="$entity/description">
          <xsl:text>&#10;       description: </xsl:text>
          <xsl:value-of select="$entity/description/en"/>
        </xsl:if>
        <xsl:text>&#10;       required: [id, type, _label]</xsl:text>
        <xsl:text>&#10;       properties:</xsl:text>
        <xsl:text>&#10;         id:</xsl:text>
        <xsl:text>&#10;           type: string</xsl:text>
        <xsl:text>&#10;           format: uri</xsl:text>
        <xsl:text>&#10;           description: |</xsl:text>
        <xsl:text>&#10;             </xsl:text><xsl:value-of select="$descriptions/*[@about='id']"/>
        <xsl:text>&#10;         type:</xsl:text>
        <xsl:text>&#10;           type: string</xsl:text>
        <xsl:text>&#10;           enum: </xsl:text><xsl:apply-templates select="$entity/mappings"/>
        <xsl:text>&#10;           description: |</xsl:text>
        <xsl:text>&#10;             </xsl:text>
                                    <xsl:choose>
                                      <xsl:when test="$id = 'exhibit'">
                                        <xsl:value-of select="$descriptions/*[@about='type-of-exhibit']"/>
                                      </xsl:when>
                                      <xsl:otherwise><xsl:value-of select="$descriptions/*[@about='type']"/></xsl:otherwise>
                                    </xsl:choose>

        <!-- Data properties -->
        <xsl:for-each select="?dprops?*">
          <xsl:if test="not(?label = $excluded)">
            <xsl:text>&#10;         </xsl:text><xsl:value-of select="?label"/><xsl:text>:</xsl:text>
            <xsl:choose>
              <xsl:when test="?label = '_label'">
                <xsl:text>&#10;           type: string</xsl:text>
                <xsl:text>&#10;           description: |</xsl:text>
                <xsl:text>&#10;             </xsl:text><xsl:value-of select="$descriptions/*[@about='label']"/>                
              </xsl:when>
              <xsl:when test="?label = 'content'">
                <xsl:text>&#10;           type: string</xsl:text>
                <xsl:text>&#10;           description: |</xsl:text>
                <xsl:text>&#10;             </xsl:text><xsl:value-of select="$descriptions/*[@about='content-name']"/>                
              </xsl:when>
              <xsl:when test="?label = 'value'">
                <xsl:text>&#10;           type: string</xsl:text>
                <xsl:text>&#10;           description: |</xsl:text>
                <xsl:text>&#10;             </xsl:text><xsl:value-of select="$descriptions/*[@about='value']"/>                
              </xsl:when>
              <xsl:when test="?label = 'begin_of_the_begin'">
                <xsl:text>&#10;           type: string</xsl:text>
                <xsl:text>&#10;           description: A string containing an ISO8601 formatted date-time, representing the earliest possible date at which the timespan could have started</xsl:text>
              </xsl:when>
              <xsl:when test="?label = 'end_of_the_end'">
                <xsl:text>&#10;           type: string</xsl:text>
                <xsl:text>&#10;           description: A string containing an ISO8601 formatted date-time, representing the latest possible date at which the timespan could have ended</xsl:text>
              </xsl:when>
            </xsl:choose>
          </xsl:if>
        </xsl:for-each>

        <xsl:variable name="array-uri" select="$descriptions/*[@type='array-uri']/@about"/>
        
        <!-- Object properties -->
        <xsl:for-each select="?oprops?*">
          <xsl:variable name="label" select="?label"/>
          <xsl:if test="not(?label = $excluded)">
            <xsl:text>&#10;         </xsl:text><xsl:value-of select="?label"/><xsl:text>:</xsl:text>            
            <xsl:choose>

              <!-- ### -->
              <!-- Premier cas de figure : json object -->

              <!-- produced_by production -->
              <xsl:when test="?label = 'produced_by'">
                <xsl:text>&#10;           $ref: '#/components/schemas/production'</xsl:text>      
              </xsl:when>

              <!-- created_by creation -->
              <xsl:when test="?label = 'created_by'">
                <xsl:text>&#10;           $ref: '#/components/schemas/creation'</xsl:text>      
              </xsl:when>

              <!-- timespan TimeSpan -->
              <xsl:when test="?label = 'timespan'">
                <xsl:text>&#10;           $ref: '#/components/schemas/timeSpan'</xsl:text>      
              </xsl:when>


              <!-- ### -->
              <!-- Deuxième cas de figure : array of string values, format URI -->
              
              <xsl:when test="?label = $array-uri">
                <xsl:text>&#10;           type: array</xsl:text>
                <xsl:text>&#10;           description: |</xsl:text>
                <xsl:text>&#10;             </xsl:text><xsl:value-of select="$descriptions/*[@about=$label]/en"/>
                <xsl:text>&#10;           items:</xsl:text>
                <xsl:text>&#10;             type: string</xsl:text>
                <xsl:text>&#10;             format: uri</xsl:text>
                
              </xsl:when>

              <!-- ### -->
              <!-- Finalement : array of json objects -->
              <xsl:otherwise>
                <xsl:text>&#10;           type: array</xsl:text>
                <xsl:text>&#10;           description: </xsl:text>
                <xsl:choose>
                  <!-- @about doit correspondre au label de la prop dans la config -->
                  <xsl:when test="$descriptions/*[@about=$label]">
                    <xsl:value-of select="$descriptions/*[@about=$label]"/>
                    <xsl:text>&#10;           items:</xsl:text>
                    <xsl:text>&#10;             $ref: '#/components/schemas/</xsl:text>
                    <xsl:choose>
                      <xsl:when test="$entity/../*[$label=@id]/@range">
                        <xsl:value-of select="$entity/../*[$label=@id]/@range"/>
                        <xsl:text>'</xsl:text>
                      </xsl:when>
                      <xsl:otherwise>
                        <xsl:value-of select="$entity/../*[$label=@id]/@id"/>
                        <xsl:text>'</xsl:text>
                      </xsl:otherwise>
                    </xsl:choose>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$descriptions/*[@about='exhibit_in_range']"/>
                    <xsl:text>&#10;           items:</xsl:text>
                    <xsl:text>&#10;             type: string</xsl:text>
                    <xsl:text>&#10;             format: uri</xsl:text>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:if>
        </xsl:for-each>
      </xsl:if> 
    </xsl:for-each>
  </xsl:template>

  <xsl:template match="mappings/mapping">
    <xsl:if test="position()  = 1">[</xsl:if>
    <xsl:value-of select="@string"/>
    <xsl:if test="position() != last()">, </xsl:if>
    <xsl:if test="position()  = last()">]</xsl:if>
  </xsl:template>

  <!--YAML refenrences-->

  <xsl:template name="_label">
    <xsl:text>&#10;     _label:</xsl:text>
    <xsl:text>&#10;       type: string</xsl:text>
    <xsl:text>&#10;       description: |</xsl:text>
    <xsl:text>&#10;         </xsl:text><xsl:value-of select="$descriptions/*[@about='label']"/>
  </xsl:template>

  <xsl:template name="uri">
    <xsl:text>&#10;     uri:</xsl:text>
    <xsl:text>&#10;       type: string</xsl:text> 
    <xsl:text>&#10;       format: uri</xsl:text> 
  </xsl:template>

  <!--Utilitaires-->

  <xsl:template name="core-properties">
    <xsl:call-template name="indent"/><xsl:text>id:</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  type: string</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  format: uri</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  description: |</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>    </xsl:text><xsl:value-of select="$descriptions/*[@about='id']"/>
    <xsl:call-template name="indent"/><xsl:text>type:</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  type: string</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  description: |</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>    </xsl:text><xsl:value-of select="$descriptions/*[@about='type']"/>
    <xsl:call-template name="indent"/><xsl:text>_label:</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  type: string</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>  description: |</xsl:text>
    <xsl:call-template name="indent"/><xsl:text>    </xsl:text><xsl:value-of select="$descriptions/*[@about='label']"/>
  </xsl:template>

  <xsl:template name="indent">
    <xsl:param name="indent" select="2" as="xsd:integer" tunnel="yes"/>
    <xsl:text>&#10; </xsl:text>
    <xsl:value-of select="string-join(for $i in 1 to $indent return '  ', '')"/>
  </xsl:template>

</xsl:stylesheet>
