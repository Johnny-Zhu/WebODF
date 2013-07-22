/**
 * @license
 * Copyright (C) 2012-2013 KO GmbH <copyright@kogmbh.com>
 *
 * @licstart
 * The JavaScript code in this page is free software: you can redistribute it
 * and/or modify it under the terms of the GNU Affero General Public License
 * (GNU AGPL) as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.  The code is distributed
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU AGPL for more details.
 *
 * As additional permission under GNU AGPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * As a special exception to the AGPL, any HTML file which merely makes function
 * calls to this code, and for that purpose includes it by reference shall be
 * deemed a separate work for copyright law purposes. In addition, the copyright
 * holders of this code give you permission to combine this code with free
 * software libraries that are released under the GNU LGPL. You may copy and
 * distribute such a system following the terms of the GNU AGPL for this code
 * and the LGPL for the libraries. If you modify this code, you may extend this
 * exception to your version of the code, but you are not obligated to do so.
 * If you do not wish to do so, delete this exception statement from your
 * version.
 *
 * This license applies to this entire compilation.
 * @licend
 * @source: http://www.webodf.org/
 * @source: http://gitorious.org/webodf/webodf/
 */

/*global core, Node, runtime, gui, odf, NodeFilter*/

runtime.loadClass("core.DomUtils");
runtime.loadClass("odf.OdfUtils");

/**
 * @constructor
 */
gui.StyleHelper = function StyleHelper(formatting) {
    "use strict";
    var domUtils = new core.DomUtils(),
        odfUtils = new odf.OdfUtils();

    /**
     * Returns an array of all unique styles in a given range for each text node
     * @param {!Range} range
     * @returns {Array.<Object>}
     */
    this.getAppliedStyles = function (range) {
        var textNodes = odfUtils.getTextNodes(range, true);
        return formatting.getAppliedStyles(textNodes);
    };

    /**
     * Apply the specified style properties to all elements within the given range.
     * Currently, only text styles are applied.
     * @param {!string} memberId Identifier of the member applying the style. This is used for naming generated autostyles
     * @param {!Range} range Range to apply text style to
     * @param {!Object} info Style information. Only data within "style:text-properties" will be considered and applied
     */
    this.applyStyle = function (memberId, range, info) {
        var nextTextNodes = domUtils.splitBoundaries(range),
            textNodes = odfUtils.getTextNodes(range, false),
            limits;

        // Avoid using the passed in range as boundaries move in strange ways as the DOM is modified
        limits = {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset
        };

        formatting.applyStyle(memberId, textNodes, limits, info);
        nextTextNodes.forEach(domUtils.normalizeTextNodes);
    };

    /**
     * Returns true if all the node within given range have the same value for
     * the property; otherwise false.
     * @param {!Range} range
     * @param {!string} propertyName
     * @param {!string} propertyValue
     * @return {!boolean}
     */
    function hasTextPropertyValue(range, propertyName, propertyValue) {
        var hasOtherValue = true,
            nodes, styles, properties, container, i;

        if (range.collapsed) {
            container = range.startContainer;
            if (container.hasChildNodes() && range.startOffset < container.childNodes.length) {
                container = container.childNodes[range.startOffset];
            }
            nodes = [container];
        } else {
            nodes = odfUtils.getTextNodes(range, true);
        }

        styles = formatting.getAppliedStyles(nodes);
        for (i = 0; i < styles.length; i += 1) {
            properties = styles[i]['style:text-properties'];
            hasOtherValue = !properties || properties[propertyName] !== propertyValue;
            if (hasOtherValue) {
                break;
            }
        }
        return !hasOtherValue;
    }

    /**
     * Returns true if all the text within the range are bold; otherwise false.
     * @param {!Range} range
     * @return {!boolean}
     */
    this.isBold = function (range) {
        return hasTextPropertyValue(range, 'fo:font-weight', 'bold');
    };

    /**
     * Returns true if all the text within the range are italic; otherwise false.
     * @param {!Range} range
     * @return {!boolean}
     */
    this.isItalic = function (range) {
        return hasTextPropertyValue(range, 'fo:font-style', 'italic');
    };

    /**
     * Returns true if all the text within the range have underline; otherwise false.
     * @param {!Range} range
     * @return {!boolean}
     */
    this.hasUnderline = function (range) {
        return hasTextPropertyValue(range, 'style:text-underline-style', 'solid');
    };

    /**
     * Returns true if all the text within the range have strike through; otherwise false.
     * @param {!Range} range
     * @return {!boolean}
     */
    this.hasStrikeThrough = function (range) {
        return hasTextPropertyValue(range, 'style:text-line-through-style', 'solid');
    };
    // These should later go and from StyleHelperTests they should be split
    // off into OdfUtilsTests
    this.getTextNodes = odfUtils.getTextNodes;
    this.getParagraphElements = odfUtils.getParagraphElements;
    this.getTextElements = odfUtils.getTextElements;
};
