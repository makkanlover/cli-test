#!/usr/bin/env python3
import click
from datetime import datetime

@click.group()
@click.version_option('1.0.0')
def cli():
    """Click CLI デモアプリケーション
    
    Clickライブラリの特徴的な機能を体験できるサンプルです。
    """
    pass

@cli.command()
@click.option('--name', '-n', default='World', help='挨拶する相手の名前')
@click.option('--count', '-c', default=1, help='挨拶を繰り返す回数')
@click.option('--greeting', '-g', default='Hello', help='挨拶の言葉')
def hello(name, count, greeting):
    """基本的な挨拶コマンド"""
    for i in range(count):
        click.echo(f'{greeting}, {name}!')
        if count > 1:
            click.echo(f'  ({i + 1}/{count})')

@cli.command()
@click.option('--items', '-i', multiple=True, help='処理するアイテム')
@click.option('--verbose', '-v', is_flag=True, help='詳細な出力を表示')
def process(items, verbose):
    """複数アイテムの処理"""
    if not items:
        items = ['item1', 'item2', 'item3']
    
    click.echo(f'Processing {len(items)} items...')
    
    with click.progressbar(items, label='Processing') as bar:
        for item in bar:
            if verbose:
                click.echo(f'  Processing: {item}')
            # シミュレーション用の遅延
            import time
            time.sleep(0.1)
    
    click.echo(click.style('✓ All items processed!', fg='green'))

@cli.command()
@click.argument('filename', type=click.Path(exists=False))
@click.option('--content', '-c', default='Hello, Click!', help='ファイルに書き込む内容')
@click.option('--append', '-a', is_flag=True, help='ファイルに追記する')
def write_file(filename, content, append):
    """ファイル操作のデモ"""
    mode = 'a' if append else 'w'
    try:
        with click.open_file(filename, mode) as f:
            f.write(f'{content}\n')
        
        action = 'Appended to' if append else 'Created'
        click.echo(click.style(f'{action} file: {filename}', fg='blue'))
    except Exception as e:
        click.echo(click.style(f'Error: {e}', fg='red'), err=True)

@cli.command()
@click.option('--format', 'output_format', 
              type=click.Choice(['json', 'csv', 'table']), 
              default='table', help='出力フォーマット')
def info(output_format):
    """システム情報の表示"""
    data = {
        'library': 'Click',
        'version': '8.0+',
        'language': 'Python',
        'timestamp': datetime.now().isoformat()
    }
    
    if output_format == 'json':
        import json
        click.echo(json.dumps(data, indent=2))
    elif output_format == 'csv':
        click.echo('key,value')
        for key, value in data.items():
            click.echo(f'{key},{value}')
    else:  # table
        click.echo('System Information:')
        for key, value in data.items():
            click.echo(f'  {key:12}: {value}')

@cli.command()
@click.confirmation_option(prompt='Are you sure you want to continue?')
def dangerous():
    """危険な操作のシミュレーション"""
    click.echo('Performing dangerous operation...')
    click.echo(click.style('Operation completed safely!', fg='green'))

if __name__ == '__main__':
    cli()