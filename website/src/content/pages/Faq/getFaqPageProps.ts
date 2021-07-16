import { PageMetadata } from '../../PageMetadata'
import fsx from 'fs-extra'
import path from 'path'
import MarkdownIt from 'markdown-it'
import cheerio from 'cheerio'

export interface FaqPageProps {
  title: string
  metadata: PageMetadata
  content: string
}

export function getFaqPageProps(): FaqPageProps {
  return {
    title: 'Frequently Asked Questions',
    metadata: {
      title: 'L2BEAT – Frequently Asked Questions',
      description:
        'L2BEAT is a analytics and research website about Ethereum layer 2 scaling.',
      image: '/meta-images/overview.png',
      url: 'https://l2beat.com/faq/',
    },
    content: getHtml(),
  }
}

function getHtml() {
  const markdown = MarkdownIt({ html: true })
  const file = fsx.readFileSync(path.join(__dirname, 'faq.md'), 'utf-8')
  const rendered = markdown.render(file)
  const $ = cheerio.load(rendered)
  $('a').each(function () {
    const $el = $(this)
    $el.attr('rel', 'noopener noreferrer')
    $el.attr('target', '_blank')
  })
  return $('body').html() ?? ''
}