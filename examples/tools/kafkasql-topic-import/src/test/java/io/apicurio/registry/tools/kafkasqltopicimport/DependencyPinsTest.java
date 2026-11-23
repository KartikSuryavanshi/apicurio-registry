/*
 * Copyright 2026 Red Hat
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.apicurio.registry.tools.kafkasqltopicimport;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Guards the dependency pins that are updated for the reported CVEs. The build no longer resolves the
 * vulnerable versions listed in the security advisories.
 */
public class DependencyPinsTest {

    private static final String JACKSON_CORE = "jackson-core";
    private static final String JACKSON_DATABIND = "jackson-databind";

    @Test
    void testJacksonPinsInKafkasqlTopicImportPom() throws IOException {
        String pom = read(repoRoot().resolve("examples/tools/kafkasql-topic-import/pom.xml"));

        assertEquals("2.18.11", dependencyVersion(pom, "com.fasterxml.jackson.core", JACKSON_CORE),
                "jackson-core must be pinned to the CVE-fixed version");
        assertEquals("2.18.8", dependencyVersion(pom, "com.fasterxml.jackson.core", JACKSON_DATABIND),
                "jackson-databind must be pinned to the CVE-fixed version");
    }

    @Test
    void testJsoupPinInSupportChatPom() throws IOException {
        String pom = read(repoRoot().resolve("support-chat/pom.xml"));

        Matcher matcher = Pattern.compile("<jsoup\\.version>([^<]+)</jsoup\\.version>").matcher(pom);
        if (!matcher.find()) {
            fail("support-chat/pom.xml does not declare a jsoup.version property");
        }
        assertEquals("1.23.2", matcher.group(1), "jsoup must be pinned to the CVE-fixed version");
    }

    @Test
    void testKiotaBuilderPinInPythonSdkProject() throws IOException {
        String csproj = read(repoRoot().resolve("python-sdk/python-sdk.csproj"));

        Matcher matcher = Pattern
                .compile("PackageReference\\s+Include=\"Microsoft\\.OpenApi\\.Kiota\\.Builder\"\\s+Version=\"([^\"]+)\"")
                .matcher(csproj);
        if (!matcher.find()) {
            fail("python-sdk/python-sdk.csproj does not reference Microsoft.OpenApi.Kiota.Builder");
        }
        assertEquals("1.32.5", matcher.group(1),
                "Microsoft.OpenApi.Kiota.Builder must be pinned to the CVE-fixed version");
    }

    private static String dependencyVersion(String pom, String groupId, String artifactId) {
        Pattern pattern = Pattern.compile("<dependency>\\s*<groupId>" + Pattern.quote(groupId) + "</groupId>\\s*"
                + "<artifactId>" + Pattern.quote(artifactId) + "</artifactId>\\s*<version>([^<]+)</version>",
                Pattern.DOTALL);
        Matcher matcher = pattern.matcher(pom);
        if (!matcher.find()) {
            fail("No version found for " + groupId + ":" + artifactId);
        }
        return matcher.group(1);
    }

    private static Path repoRoot() {
        String base = System.getProperty("basedir", System.getProperty("user.dir", "."));
        Path current = Path.of(base).toAbsolutePath().normalize();
        while (current != null) {
            if (Files.isRegularFile(current.resolve("python-sdk/python-sdk.csproj"))
                    && Files.isRegularFile(current.resolve("support-chat/pom.xml"))) {
                return current;
            }
            current = current.getParent();
        }
        throw new IllegalStateException("Could not locate the repository root from " + base);
    }

    private static String read(Path path) throws IOException {
        return new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
    }
}
